import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust the base URL to match your backend
});

// Example API call to register a user
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Example API call to login a user
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Example API call to get all lessons
export const fetchLessons = async () => {
  const response = await api.get('/lessons');
  return response.data;
};

// Example API call to create a lesson
export const createLesson = async (lessonData, token) => {
  const response = await api.post('/lessons', lessonData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Example API call to get a quiz by lesson ID
export const fetchQuizByLesson = async (lessonId) => {
  const response = await api.get(`/quizzes/${lessonId}`);
  return response.data;
};

// Example API call to submit a quiz
export const submitQuiz = async (lessonId, answers, token) => {
  const response = await api.post(`/quizzes/${lessonId}/submit`, { answers }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};