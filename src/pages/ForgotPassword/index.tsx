import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset, Email, Lock } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { authApi } from '@/api/endpoints/auth.api';
import { ROUTES } from '@/routes/routes.config';

const RESEND_COOLDOWN_SECONDS = 60;

const getErrorMessage = (err: unknown, fallback: string): string =>
  (isAxiosError(err) && err.response?.data?.message) || fallback;

const gradientButtonSx = {
  mt: 3,
  py: 1.5,
  borderRadius: 2,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
  },
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const steps = ['Email', 'Reset Password'];

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const requestOtp = async () => {
    const response = await authApi.forgotPassword(email.trim());
    setInfo(response.data?.message || "If an account exists for this email, we've sent an OTP.");
    setResendCountdown(RESEND_COOLDOWN_SECONDS);
  };

  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Invalid email format');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await requestOtp();
      setActiveStep(1);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError('');
      setOtp('');
      await requestOtp();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to resend OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authApi.resetPassword({ email: email.trim(), otp, newPassword, confirmPassword });
      toast.success('Password reset successfully. Please log in.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setError(getErrorMessage(err, 'Password reset failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep(0);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setInfo('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
        }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              y: [-20, -100, -20],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 4,
              height: 4,
              background: 'white',
              borderRadius: '50%',
            }}
          />
        ))}
      </Box>

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'visible',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Logo */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <LockReset sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                </motion.div>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Forgot Password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reset your password using the email you registered with
                </Typography>
              </Box>

              {/* Stepper */}
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 1: Email */}
              {activeStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      margin="normal"
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      type="submit"
                      disabled={loading}
                      sx={gradientButtonSx}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                    </Button>
                  </Box>
                </motion.div>
              )}

              {/* Step 2: OTP + New Password */}
              {activeStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {info && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {info}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
                    <TextField
                      fullWidth
                      label="Enter OTP"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(value);
                        setError('');
                      }}
                      margin="normal"
                      inputProps={{
                        maxLength: 6,
                        style: { textAlign: 'center', fontSize: 24, letterSpacing: 8 },
                      }}
                      placeholder="000000"
                    />

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                      OTP valid for 10 minutes
                    </Typography>

                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                      }}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      sx={gradientButtonSx}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                    </Button>
                  </Box>

                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      onClick={handleResendOtp}
                      disabled={loading || resendCountdown > 0}
                      sx={{ textTransform: 'none' }}
                    >
                      {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Didn't receive OTP? Resend"}
                    </Button>
                  </Box>

                  <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Button onClick={handleBack} sx={{ textTransform: 'none' }}>
                      Back
                    </Button>
                  </Box>
                </motion.div>
              )}

              {/* Login Link */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Remembered your password?{' '}
                  <Button
                    onClick={() => navigate(ROUTES.LOGIN)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Back to Sign In
                  </Button>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
