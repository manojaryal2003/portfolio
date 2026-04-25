const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const { upload, uploadMedia, cloudinary } = require('../config/cloudinary');

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === 'true') filter.isFeatured = true;
    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// fields: up to 15 images + 1 video
const mediaFields = uploadMedia.fields([
  { name: 'images', maxCount: 15 },
  { name: 'video', maxCount: 1 },
]);

router.post('/', protect, mediaFields, async (req, res) => {
  try {
    const projectData = { ...req.body };
    if (req.body.technologies) {
      projectData.technologies = typeof req.body.technologies === 'string'
        ? JSON.parse(req.body.technologies)
        : req.body.technologies;
    }

    // images array
    if (req.files?.images?.length) {
      projectData.images = req.files.images.map(f => ({ url: f.path, publicId: f.filename }));
      // first image also becomes the cover
      projectData.image = req.files.images[0].path;
      projectData.imagePublicId = req.files.images[0].filename;
    }

    // video
    if (req.files?.video?.length) {
      const v = req.files.video[0];
      projectData.video = { url: v.path, publicId: v.filename };
    }

    const project = await Project.create(projectData);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, mediaFields, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // only pick safe scalar fields from body — never trust serialized objects
    const allowedFields = ['title', 'description', 'technologies', 'category',
                           'githubUrl', 'liveUrl', 'completionDate', 'isFeatured',
                           'order', 'removedImageIds', 'removeVideo'];
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    }

    if (updateData.technologies) {
      updateData.technologies = typeof updateData.technologies === 'string'
        ? JSON.parse(updateData.technologies)
        : updateData.technologies;
    }

    // start with a mutable copy of existing images
    let currentImages = [...(project.images || [])];

    // remove individually-deleted images first
    if (req.body.removedImageIds) {
      const ids = JSON.parse(req.body.removedImageIds);
      await Promise.all(ids.map(id => cloudinary.uploader.destroy(id)));
      currentImages = currentImages.filter(img => !ids.includes(img.publicId));
    }

    // append newly uploaded images
    if (req.files?.images?.length) {
      const newImgs = req.files.images.map(f => ({ url: f.path, publicId: f.filename }));
      currentImages = [...currentImages, ...newImgs];
    }

    // persist merged image list
    updateData.images = currentImages;
    if (currentImages.length) {
      updateData.image = currentImages[0].url;
      updateData.imagePublicId = currentImages[0].publicId;
    } else {
      updateData.image = '';
      updateData.imagePublicId = '';
    }

    // new video uploaded
    if (req.files?.video?.length) {
      if (project.video?.publicId) {
        await cloudinary.uploader.destroy(project.video.publicId, { resource_type: 'video' });
      }
      const v = req.files.video[0];
      updateData.video = { url: v.path, publicId: v.filename };
    }

    // video removed
    if (req.body.removeVideo === 'true' && project.video?.publicId) {
      await cloudinary.uploader.destroy(project.video.publicId, { resource_type: 'video' });
      updateData.video = { url: '', publicId: '' };
    }

    delete updateData.removedImageIds;
    delete updateData.removeVideo;

    const updated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // delete all images
    if (project.images?.length) {
      await Promise.all(project.images.map(img =>
        img.publicId ? cloudinary.uploader.destroy(img.publicId) : Promise.resolve()
      ));
    } else if (project.imagePublicId) {
      await cloudinary.uploader.destroy(project.imagePublicId);
    }

    // delete video
    if (project.video?.publicId) {
      await cloudinary.uploader.destroy(project.video.publicId, { resource_type: 'video' });
    }

    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
