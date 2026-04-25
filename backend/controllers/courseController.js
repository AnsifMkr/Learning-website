const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

exports.getAllCourses = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'all' ? { category } : {};
    const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

exports.getCourseBySlug = async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).lean();
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    next(err);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    // We update by slug
    const updated = await Course.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndDelete({ slug: req.params.slug });
    if (course) {
      await Lesson.deleteMany({ courseId: course._id }); 
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
