const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const Admin = require('../models/Admin');
const Hero = require('../models/Hero');
const About = require('../models/About');
const Stat = require('../models/Stat');
const Skill = require('../models/Skill');
const Service = require('../models/Service');
const Experience = require('../models/Experience');
const Social = require('../models/Social');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Admin
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
      console.log('Admin created');
    }

    // Hero
    await Hero.deleteMany();
    await Hero.create({
      name: 'Manoj Aryal',
      title: 'Full Stack Developer & Project Manager',
      typingTexts: ['Full Stack Developer', 'MERN Stack Developer', 'Project Manager', 'Web Application Architect', 'CTO at Smart IT Solution'],
      introduction: 'Passionate Full Stack Developer & Project Manager at Smart IT Solution. I build modern, scalable web applications and lead high-performing development teams to deliver exceptional digital solutions.',
    });

    // About
    await About.deleteMany();
    await About.create({
      description: 'I am a results-driven Full Stack Developer and Project Manager with extensive experience building robust web applications using the MERN stack. As CTO at Smart IT Solution, I lead development teams, architect scalable systems, and deliver innovative digital solutions to clients worldwide.',
      role: 'Full Stack Developer & Project Manager / CTO',
      company: 'Smart IT Solution',
      experience: '5+ years in Full Stack Development and Project Management',
      expertise: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'Project Management', 'System Architecture', 'Team Leadership'],
    });

    // Stats
    await Stat.deleteMany();
    await Stat.insertMany([
      { label: 'Projects Completed', value: 50, suffix: '+', icon: 'FaProjectDiagram', order: 1 },
      { label: 'Clients Served', value: 30, suffix: '+', icon: 'FaUsers', order: 2 },
      { label: 'Team Members Managed', value: 15, suffix: '+', icon: 'FaUserTie', order: 3 },
      { label: 'Years of Experience', value: 5, suffix: '+', icon: 'FaBriefcase', order: 4 },
    ]);

    // Skills
    await Skill.deleteMany();
    await Skill.insertMany([
      { name: 'React.js', category: 'Frontend', proficiency: 95, icon: 'FaReact', order: 1 },
      { name: 'JavaScript', category: 'Frontend', proficiency: 92, icon: 'SiJavascript', order: 2 },
      { name: 'HTML5', category: 'Frontend', proficiency: 98, icon: 'FaHtml5', order: 3 },
      { name: 'CSS3', category: 'Frontend', proficiency: 90, icon: 'FaCss3Alt', order: 4 },
      { name: 'Tailwind CSS', category: 'Frontend', proficiency: 92, icon: 'SiTailwindcss', order: 5 },
      { name: 'Node.js', category: 'Backend', proficiency: 90, icon: 'FaNodeJs', order: 6 },
      { name: 'Express.js', category: 'Backend', proficiency: 88, icon: 'SiExpress', order: 7 },
      { name: 'MongoDB', category: 'Database', proficiency: 88, icon: 'SiMongodb', order: 8 },
      { name: 'MySQL', category: 'Database', proficiency: 80, icon: 'SiMysql', order: 9 },
      { name: 'Git', category: 'Tools & Platforms', proficiency: 90, icon: 'FaGit', order: 10 },
      { name: 'Docker', category: 'Tools & Platforms', proficiency: 75, icon: 'FaDocker', order: 11 },
      { name: 'Firebase', category: 'Tools & Platforms', proficiency: 78, icon: 'SiFirebase', order: 12 },
    ]);

    // Services
    await Service.deleteMany();
    await Service.insertMany([
      { title: 'Full Stack Web Development', description: 'End-to-end web application development from concept to deployment using modern technologies.', icon: 'FaCode', order: 1 },
      { title: 'MERN Stack Development', description: 'Specialized in MongoDB, Express.js, React.js, and Node.js for powerful applications.', icon: 'FaLayerGroup', order: 2 },
      { title: 'API Development', description: 'RESTful and GraphQL API design and development with proper documentation.', icon: 'FaServer', order: 3 },
      { title: 'System Architecture Design', description: 'Scalable and maintainable system design tailored to business requirements.', icon: 'FaProjectDiagram', order: 4 },
      { title: 'Project Management', description: 'Agile project management ensuring on-time delivery and team coordination.', icon: 'FaTasks', order: 5 },
      { title: 'Technical Consultation', description: 'Expert technical advice on technology stack, architecture, and development strategy.', icon: 'FaComments', order: 6 },
    ]);

    // Experience
    await Experience.deleteMany();
    await Experience.create({
      company: 'Smart IT Solution',
      role: 'Full Stack Developer & Project Manager / CTO',
      startDate: '2020',
      endDate: 'Present',
      isCurrent: true,
      description: 'Leading development teams and delivering innovative digital solutions for clients worldwide.',
      responsibilities: [
        'Managing and mentoring development teams',
        'Planning and architecting project infrastructure',
        'Delivering full stack web solutions to clients',
        'Coordinating development workflows using Agile methodology',
        'Client communication and requirement analysis',
        'Code review and quality assurance',
      ],
      technologies: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'Docker', 'Git'],
      order: 1,
    });

    // Socials
    await Social.deleteMany();
    await Social.insertMany([
      { platform: 'LinkedIn', url: 'https://linkedin.com', icon: 'FaLinkedin', order: 1 },
      { platform: 'GitHub', url: 'https://github.com', icon: 'FaGithub', order: 2 },
      { platform: 'Twitter', url: 'https://twitter.com', icon: 'FaTwitter', order: 3 },
      { platform: 'Instagram', url: 'https://instagram.com', icon: 'FaInstagram', order: 4 },
    ]);

    console.log('Seed data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
