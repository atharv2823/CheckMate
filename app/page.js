"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [progress, setProgress] = useState(0);
  const [showArchive, setShowArchive] = useState(false);
  const [archivedSummaries, setArchivedSummaries] = useState([]);

  useEffect(() => {
    const storedTasks = localStorage.getItem("todos");
    const storedArchive = localStorage.getItem("taskArchive");
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    if (storedArchive) setArchivedSummaries(JSON.parse(storedArchive));
  }, []);

  useEffect(() => {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalProgress =
      tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    setProgress(totalProgress);
    localStorage.setItem("todos", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      text: newTask,
      completed: false,
      date: new Date().toISOString().split("T")[0],
    };

    setTasks([...tasks, task]);
    setNewTask("");
  };

  const toggleTask = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter((task) => task.id !== taskId));
    }
  };

  const deleteArchivedSummary = (index) => {
    if (
      window.confirm("Are you sure you want to delete this archived summary?")
    ) {
      const newArchive = archivedSummaries.filter((_, i) => i !== index);
      setArchivedSummaries(newArchive);
      localStorage.setItem("taskArchive", JSON.stringify(newArchive));
    }
  };

  const clearAllTasks = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all tasks? This cannot be undone."
      )
    ) {
      setTasks([]);
      localStorage.removeItem("todos");
    }
  };

  const clearAllArchives = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all archived summaries? This cannot be undone."
      )
    ) {
      setArchivedSummaries([]);
      localStorage.removeItem("taskArchive");
    }
  };

  const saveDailySummary = (date, dateTasks) => {
    const summary = {
      date,
      totalTasks: dateTasks.length,
      completedTasks: dateTasks.filter((task) => task.completed).length,
      tasks: dateTasks,
      savedAt: new Date().toISOString(),
    };

    const newArchive = [summary, ...archivedSummaries];
    setArchivedSummaries(newArchive);
    localStorage.setItem("taskArchive", JSON.stringify(newArchive));
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const groupedTasks = tasks.reduce((groups, task) => {
    if (!groups[task.date]) {
      groups[task.date] = [];
    }
    groups[task.date].push(task);
    return groups;
  }, {});

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CheckMate
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowArchive(!showArchive)}
            className="flex-1 md:flex-none px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            {showArchive ? "Show Tasks" : "View Archive"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={showArchive ? clearAllArchives : clearAllTasks}
            className="flex-1 md:flex-none px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Clear All {showArchive ? "Archives" : "Tasks"}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!showArchive ? (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Progress</span>
                <motion.span
                  key={progress}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-semibold"
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full rounded-full transition-colors duration-500 ${getProgressColor(
                    progress
                  )}`}
                />
              </div>
            </div>

            <form onSubmit={addTask} className="mb-8">
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                  placeholder="Add a new task..."
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Task
                </motion.button>
              </div>
            </form>

            <div className="space-y-6">
              {Object.entries(groupedTasks)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .map(([date, dateTasks]) => (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 rounded-lg shadow-md"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2">
                      <h2 className="text-xl font-semibold">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h2>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => saveDailySummary(date, dateTasks)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors w-full md:w-auto"
                      >
                        Save Summary
                      </motion.button>
                    </div>
                    <div className="space-y-2">
                      {dateTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTask(task.id)}
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span
                              className={
                                task.completed
                                  ? "line-through text-gray-500"
                                  : ""
                              }
                            >
                              {task.text}
                            </span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteTask(task.id)}
                            className="px-3 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Delete
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      {dateTasks.filter((task) => task.completed).length} of{" "}
                      {dateTasks.length} tasks completed
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="archive"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold mb-4">Archived Summaries</h2>
            {archivedSummaries.map((summary, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
                  <h3 className="text-lg font-semibold">
                    {new Date(summary.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm text-gray-500">
                      Saved: {new Date(summary.savedAt).toLocaleString()}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteArchivedSummary(index)}
                      className="px-3 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Total Tasks: {summary.totalTasks}</p>
                  <p>Completed Tasks: {summary.completedTasks}</p>
                  <p>
                    Completion Rate:{" "}
                    {Math.round(
                      (summary.completedTasks / summary.totalTasks) * 100
                    )}
                    %
                  </p>
                </div>
                <div className="mt-3">
                  <h4 className="font-semibold mb-2">Tasks:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {summary.tasks.map((task, i) => (
                      <li
                        key={i}
                        className={
                          task.completed ? "text-gray-500 line-through" : ""
                        }
                      >
                        {task.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
