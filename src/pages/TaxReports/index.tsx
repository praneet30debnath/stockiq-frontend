import { Box, Typography, Card, CardContent } from '@mui/material';
import { Assessment } from '@mui/icons-material';
import { motion } from 'framer-motion';

const TaxReports = () => {
  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Tax Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Calculate capital gains and generate tax reports
          </Typography>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <Assessment sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, margin: '0 auto' }}>
              Automatically calculate Short-term and Long-term Capital Gains (STCG/LTCG) for Indian tax filing.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default TaxReports;
