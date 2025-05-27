const Lesson = require('../models/Lesson');

// ✅ Get all lessons (supports skillPath + pagination)
exports.getAllLessons = async (req, res, next) => {
  try {
    const { skillPath, page = 1, limit = 10 } = req.query;

    const filter = skillPath && skillPath !== 'all' ? { skillPath } : {};

    const lessons = await Lesson.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json(lessons);
  } catch (err) {
    next(err);
  }
};

// ✅ Get a single lesson by ID
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.status(200).json(lesson);
  } catch (err) {
    console.error('Error fetching lesson:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Create lesson (admin only)
exports.createLesson = async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Lesson creation failed', details: err.message });
  }
};

// ✅ Create lesson by skill path (admin only)
exports.createLessonBySkillPath = async (req, res) => {
  try {
    const { skillPath } = req.params;
    const { title, content, type, day } = req.body;

    if (!title || !content || !type || !day) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newLesson = new Lesson({
      title,
      content,
      type,
      day,
      skillPath,
    });

    await newLesson.save();
    res.status(201).json(newLesson);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create lesson', details: err.message });
  }
};

exports.getLessonsBySkillPath = async (req, res) => {
  try {
    const { skillPath } = req.params;
    const lessons = await Lesson.find({ skillPath }).sort({ day: 1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lessons by skillPath', details: err.message });
  }
};
