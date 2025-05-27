import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchLessons } from "../features/lessonsSlice"; // Assuming you have a slice for lessons

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLessons());
  }, [dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Welcome to the Learning Platform</h1>
      <p className="mt-4 text-lg">Explore lessons and quizzes to enhance your skills.</p>
    </div>
  );
}