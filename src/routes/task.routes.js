import {Router} from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addTask, deleteTask, editTask, getSingleTask, getTasksAnalytics, getTasksByDuration, toggleChecklistItem, updateTaskState } from "../controllers/task.controller.js";

const router = Router();

//Auth Required
router.post('/', verifyJWT, addTask);
router.put('/:taskId', verifyJWT, editTask);
router.delete('/:taskId', verifyJWT, deleteTask);
router.patch('/state/:taskId', verifyJWT, updateTaskState);
router.patch('/:taskId/checklists/:checklistId', verifyJWT, toggleChecklistItem);
router.get('/', verifyJWT, getTasksByDuration);
router.get('/analytics', verifyJWT, getTasksAnalytics);

//Public Call
router.get('/:taskId', getSingleTask);

export default router;