import mongoose, {Schema} from "mongoose";

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        checklists: {
            type: [{
              description: String,
              isChecked: {
                type: Boolean,
                default: false
              }
            }],
            validate: [(val)=> val.length > 0, '{PATH} must have at least one checklist item']
          },
        priority: {
            type: String,
            enum: ["low", "moderate", "high"],
            required: true,
        },
        dueDate: String,
        state: {
            type: String,
            enum: ["backlog", "progress", "to-do", "done"],
            default: "to-do",
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
  { timestamps: true }
);
 
export const Task = mongoose.model("Task", taskSchema);