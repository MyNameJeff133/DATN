import mongoose from "mongoose";
import ForumPost from "../models/ForumPost.js";

mongoose.connect("mongodb://localhost:27017/UrDoctor");

const seed = async () => {
  await ForumPost.create({
    title: "Bài test forum",
    content: "Demo bài viết",
    author: new mongoose.Types.ObjectId()
  });
  console.log("Done");
  process.exit();
};
seed();