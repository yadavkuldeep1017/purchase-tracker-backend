
const corsOptions = {
  origin: 'http://localhost:3000', // Your frontend's origin
  // origin: ['http://localhost:3000', 'https://your-production-domain.com'], // For multiple origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
  credentials: true, // If you need to send cookies
};

module.exports=corsOptions;