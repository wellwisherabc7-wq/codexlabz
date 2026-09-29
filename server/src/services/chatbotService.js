const { GoogleGenerativeAI } = require('@google/generative-ai');
const Project = require('../models/Project');
const Task = require('../models/Task');

const buildClientContext = async (clientId) => {
  const projects = await Project.find({ clientId }).sort({ createdAt: -1 });
  if (!projects.length) {
    return 'No projects found for this client.';
  }

  const summaries = [];
  for (const proj of projects) {
    const tasks = await Task.find({ projectId: proj._id }).sort({ createdAt: 1 });
    const counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    const total = tasks.length;
    const progress = total === 0 ? 0 : Math.round((counts.DONE / total) * 100);

    const pendingWithDueDate = tasks
      .filter((t) => t.status !== 'DONE' && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const nextTask =
      pendingWithDueDate[0] ||
      tasks.find((t) => t.status === 'IN_PROGRESS') ||
      tasks.find((t) => t.status === 'TODO') ||
      null;

    summaries.push({
      projectName: proj.name,
      description: proj.description || 'No description provided',
      status: proj.status,
      startDate: proj.createdAt ? new Date(proj.createdAt).toISOString().split('T')[0] : 'N/A',
      deadline: proj.deadline ? new Date(proj.deadline).toISOString().split('T')[0] : 'No deadline set',
      totalTasks: total,
      tasksByStatus: counts,
      progressPercentage: `${progress}%`,
      nextUpcomingPendingTask: nextTask
        ? {
            title: nextTask.title,
            status: nextTask.status,
            priority: nextTask.priority,
            dueDate: nextTask.dueDate
              ? new Date(nextTask.dueDate).toISOString().split('T')[0]
              : 'No specific due date',
          }
        : 'All tasks completed or none assigned',
    });
  }

  return JSON.stringify(summaries, null, 2);
};

const askGemini = async (userMessage, contextText) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const systemInstruction =
    "You are a helpful assistant inside a client's project portal. Answer the user's question using ONLY the project data provided below. Be concise and friendly. If the question asks about something not covered in the data, say you don't have that information rather than guessing. Never mention other clients or make up numbers.\n\nPROJECT DATA:\n" +
    contextText;

  const candidateModels = [
    process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
  ];

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      lastError = err;
      console.warn(`Model ${modelName} call failed: ${err.message}. Trying next model...`);
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini');
};

module.exports = {
  buildClientContext,
  askGemini,
};
