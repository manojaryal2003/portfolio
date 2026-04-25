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

    const updateData = { ...req.body };
    if (req.body.technologies) {
      updateData.technologies = typeof req.body.technologies === 'string'
        ? JSON.parse(req.body.technologies)
        : req.body.technologies;
    }

    // new images uploaded — delete old ones then replace
    if (req.files?.images?.length) {
      if (project.images?.length) {
        await Promise.all(project.images.map(img =>
          img.publicId ? cloudinary.uploader.destroy(img.publicId) : Promise.resolve()
        ));
      } else if (project.imagePublicId) {
        await cloudinary.uploader.destroy(project.imagePublicId);
      }
      updateData.images = req.files.images.map(f => ({ url: f.path, publicId: f.filename }));
      updateData.image = req.files.images[0].path;
      updateData.imagePublicId = req.files.images[0].filename;
    }

    // handle removed images sent from frontend as JSON
    if (req.body.removedImageIds) {
      const ids = JSON.parse(req.body.removedImageIds);
      await Promise.all(ids.map(id => cloudinary.uploader.destroy(id)));
      updateData.images = (project.images || []).filter(img => !ids.includes(img.publicId));
      if (updateData.images.length) {
        updateData.image = updateData.images[0].url;
        updateData.imagePublicId = updateData.images[0].publicId;
      }
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
