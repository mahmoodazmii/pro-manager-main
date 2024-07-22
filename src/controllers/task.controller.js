import { Task } from "../models/task.model.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const addTask = asyncHandler(async (req, res)=> {
    const {title, priority, checklists=[], dueDate} = req.body;

    if(!title?.trim() || !priority || !checklists?.length) throw new ApiError(400, "Required fields are missing!");

    const newTask = await Task.create({
        title: title.trim(),
        priority: priority.toLowerCase(),
        checklists,
        dueDate: dueDate || "",
        user: req.user?._id
    })

    if(!newTask) throw new ApiError(500, "Error occurred while creating a task!");

    res.status(201).json(
        new ApiResponse(201, "New task created successfully!", {task: newTask})
    )

})

const editTask = asyncHandler(async (req, res)=> {
    const {taskId} = req.params;
    const {title, priority, checklists=[], dueDate} = req.body;

    if(!title.trim() || !priority || !checklists?.length) throw new ApiError(400, "Required fields are missing!");

    const updatedTask = await Task.findByIdAndUpdate(taskId, {
        $set: {
            title: title.trim(),
            priority: priority.toLowerCase(),
            checklists,
            dueDate: dueDate || "",
        }
    }, {
        new: true
    })

    if(!updatedTask) throw new ApiError(500, "Error occurred while updating a task!");

    res.status(201).json(
        new ApiResponse(201, "Task updated successfully!", {task: updatedTask})
    )

})

const deleteTask = asyncHandler(async (req, res)=> {
    const {taskId} = req.params;

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if(!deletedTask) throw new ApiError(500, "Error occurred while deleting the task!");

    res.status(204).json(
        new ApiResponse(204, "", {})
    )
})

const getTasksByDuration = asyncHandler(async (req, res)=> {

    const {duration} = req.query;

    let startDate = new Date();
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (duration === "Today") startDate.setHours(0, 0, 0, 0); // Start of the day
    else if (duration === "Week") startDate.setDate(startDate.getDate() - 6); // Start of the week
    else if (duration === "Month") startDate.setDate(startDate.getDate() - 29); // Start of the month

    //console.log(startDate, endDate);

    const tasksByState = {
        "backlog": [],
        "to-do": [],
        "progress": [],
        "done": []

    }
    const allTasks = await Task.find(
        {
            user: req.user?._id, 
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }
    )

    allTasks.forEach((task)=> tasksByState[task.state]?.push(task))

    res.status(200).json(
        new ApiResponse(200, "Tasks fetched successfully!", {tasks: tasksByState})
    )
})

const getSingleTask = asyncHandler(async (req, res)=> {
    const {taskId} = req.params;

    const task = await Task.findById(taskId).populate("user", "name -_id");

    if(!task) throw new ApiError(404, "Task does not exists!");

    res.status(200).json(
        new ApiResponse(200, "Task fetched successfully!", {task})
    )
    
})

const updateTaskState = asyncHandler(async (req, res)=> {
    const {state} = req.body;
    const {taskId} = req.params;

    const updatedTask = await Task.findByIdAndUpdate(taskId, 
        {
            $set: {
                state
            }
        }
    )

    if(!updatedTask) throw new ApiError(500, "Error occurred while updating state!");

    res.status(204).json(
        new ApiResponse(204, "", {})
    )
})

const getTasksAnalytics = asyncHandler(async (req, res)=> {
    
    const taskPiplines = [
        [{
            $match: {
              user: req.user?._id
            }
          }, {
            $group: {
              _id: "$state",
              count: {$sum: 1}
            }
          }, 
          {
            $group: {
            _id: null,
            counts: { $push: { name: '$_id', count: '$count' } }
            }
        }], 
        [{
            $match: {
              user: req.user?._id,
              state: {$ne: "done"},
            }
          }, {
            $group: {
              _id: "$priority",
              count: {$sum: 1}
            }
          }, 
          {
            $group: {
            _id: null,
            counts: { $push: { name: '$_id', count: '$count' } }
            }
        }], 
        [{
            $match: {
              user: req.user?._id,
              dueDate: {$ne: ""},
              state: {$ne: "done"},
            }
          }, {
            $group: {
              _id: null,
              count: {$sum: 1}
            }
          }, {
            $project: {
                _id: 0,
                name: "dueDate",
                count: "$count"
            }
        }]
    ]

    const [stateAnalytics, priorityAnalytics, dueDateAnalytics] = await Promise.all(
        taskPiplines.map((pipeline)=> Task.aggregate(pipeline))
    )

    const tasksCount = {};

    for (const {name, count} of [...(stateAnalytics[0]?.counts ?? []), ...(priorityAnalytics[0]?.counts ?? []), (dueDateAnalytics[0] ?? {})]) {
        if(name) tasksCount[name] = count;
    }

    res.status(200).json(
        new ApiResponse(200, "Tasks Analytics fetched successfully", {analytics: tasksCount})
    )
    
})

const toggleChecklistItem = asyncHandler(async (req, res)=> {
    const {taskId, checklistId} = req.params;

    await Task.findOneAndUpdate(
        { _id: taskId, 'checklists._id': checklistId },
        { $set: { 'checklists.$.isChecked': req.body.isChecked } },
    );

    res.status(204).json(
        new ApiResponse(204, "", {})
    )
})

export {
    addTask,
    editTask,
    deleteTask,
    getTasksByDuration,
    getSingleTask,
    updateTaskState,
    getTasksAnalytics,
    toggleChecklistItem,
}