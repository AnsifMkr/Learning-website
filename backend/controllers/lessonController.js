const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// GET /api/courses/:courseSlug/lessons
exports.getLessonsByCourse = async (req, res, next) => {
  try {
    const { courseSlug } = req.params;
    const course = await Course.findOne({ slug: courseSlug }).lean();
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const lessons = await Lesson.find({ courseId: course._id }).sort({ day: 1 }).lean();
    res.json(lessons);
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/:courseSlug/:lessonSlug
exports.getLessonBySlug = async (req, res, next) => {
  try {
    const lesson = await Lesson.findOne({ slug: req.params.lessonSlug }).lean();
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    res.json(lesson);
  } catch (err) {
    next(err);
  }
};

exports.createLesson = async (req, res, next) => {
  try {
    const newLesson = new Lesson(req.body);
    await newLesson.save();
    res.status(201).json(newLesson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const updated = await Lesson.findOneAndUpdate({ slug: req.params.lessonSlug }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteLesson = async (req, res, next) => {
  try {
    await Lesson.findOneAndDelete({ slug: req.params.lessonSlug });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
