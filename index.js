import mongoose from "mongoose";
import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

mongoose
  .connect(
    "mongodb+srv://Mahmood:Mahmood91@cluster0.clb64lt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`⚙ Server started at port ${PORT}`);
});
