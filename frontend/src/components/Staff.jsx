import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/api";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Switch,
} from "@mui/material";
import { Edit, Delete, Add, Save, Cancel, Schedule, PersonAdd } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gender: "",
  role: "Waiter",
  department: "Service",
  salary: 0,
  salaryDueDate: new Date(),
  joiningDate: new Date(),
  shiftSchedule: [],
  status: "Active",
  image: "",
  notes: "",
};

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const roles = ["Chef", "Waiter", "Manager", "Cleaner", "Cashier", "Receptionist", "Delivery", "Kitchen Assistant"];
const departments = ["Kitchen", "Service", "Billing", "Cleaning", "Reception", "Delivery", "Management"];
const statuses = ["Active", "On Leave", "Terminated"];
const genders = ["Male", "Female", "Other"];

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [dayToggles, setDayToggles] = useState(
    weekdays.reduce((acc, day) => ({ ...acc, [day]: false }), {})
  );

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/staff");
      setStaffList(res.data.staff);
    } catch (error) {
      alert("Failed to fetch staff.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleDateChange = (date, field) => {
    setForm({ ...form, [field]: date });
  };

  const handleDayToggle = (day) => {
    setDayToggles((prev) => ({ ...prev, [day]: !prev[day] }));
    setForm((prevForm) => {
      const updatedSchedule = prevForm.shiftSchedule.filter((s) => s.day !== day);
      if (!dayToggles[day]) {
        updatedSchedule.push({ day, timeSlots: [{ start: "09:00", end: "17:00" }] });
      }
      return { ...prevForm, shiftSchedule: updatedSchedule };
    });
  };

  const handleShiftChange = (day, field, value) => {
    setForm((prevForm) => {
      const updatedSchedule = [...prevForm.shiftSchedule];
      const dayIndex = updatedSchedule.findIndex((s) => s.day === day);

      if (dayIndex >= 0) {
        updatedSchedule[dayIndex].timeSlots[0] = {
          ...updatedSchedule[dayIndex].timeSlots[0],
          [field]: value,
        };
      }

      return { ...prevForm, shiftSchedule: updatedSchedule };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...form,
        shiftSchedule: form.shiftSchedule.filter(
          (schedule) => schedule.timeSlots[0].start && schedule.timeSlots[0].end
        ),
      };
      if (editingId) {
        await axiosInstance.put(`/staff/${editingId}`, payload);
      } else {
        await axiosInstance.post("/staff/add", payload);
      }
      setForm(initialForm);
      setEditingId(null);
      setOpenDialog(false);
      setDayToggles(weekdays.reduce((acc, day) => ({ ...acc, [day]: false }), {}));
      fetchStaff();
    } catch (error) {
      alert("Error saving staff: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staff) => {
    setForm({
      ...staff,
      salaryDueDate: staff.salaryDueDate ? new Date(staff.salaryDueDate) : new Date(),
      joiningDate: staff.joiningDate ? new Date(staff.joiningDate) : new Date(),
    });
    setDayToggles(
      weekdays.reduce(
        (acc, day) => ({
          ...acc,
          [day]: staff.shiftSchedule.some((s) => s.day === day),
        }),
        {}
      )
    );
    setEditingId(staff._id);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/staff/${id}`);
      fetchStaff();
    } catch (error) {
      alert("Error deleting staff: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setForm(initialForm);
    setEditingId(null);
    setDayToggles(weekdays.reduce((acc, day) => ({ ...acc, [day]: false }), {}));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const filteredStaff = staffList.filter((staff) => {
    if (filter === "all") return true;
    return staff.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "On Leave":
        return "warning";
      case "Terminated":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          p: { xs: 3, md: 6 },
          bgcolor: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
          minHeight: "100vh",
          transition: "all 0.3s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 8,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: "grey.900",
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Staff Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={handleAddNew}
            sx={{
              bgcolor: "indigo.600",
              "&:hover": { bgcolor: "indigo.700" },
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: "medium",
              transition: "all 0.3s ease",
            }}
          >
            Add New Staff
          </Button>
        </Box>

        <Paper
          sx={{
            p: 4,
            mb: 8,
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            bgcolor: "white",
            transition: "all 0.3s ease",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
            <Typography variant="h6" sx={{ fontWeight: "medium", color: "grey.800" }}>
              Filter by Status:
            </Typography>
            <Chip
              label="All"
              variant={filter === "all" ? "filled" : "outlined"}
              onClick={() => setFilter("all")}
              sx={{
                bgcolor: filter === "all" ? "indigo.600" : "grey.100",
                color: filter === "all" ? "white" : "grey.800",
                fontWeight: "medium",
                borderRadius: 2,
                "&:hover": { bgcolor: filter === "all" ? "indigo.700" : "grey.200" },
              }}
            />
            {statuses.map((status) => (
              <Chip
                key={status}
                label={status}
                variant={filter === status ? "filled" : "outlined"}
                onClick={() => setFilter(status)}
                color={getStatusColor(status)}
                sx={{
                  bgcolor: filter === status ? undefined : "grey.100",
                  color: filter === status ? "white" : "grey.800",
                  fontWeight: "medium",
                  borderRadius: 2,
                  "&:hover": { bgcolor: filter === status ? undefined : "grey.200" },
                }}
              />
            ))}
          </Box>
        </Paper>

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            bgcolor: "white",
            transition: "all 0.3s ease",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.200" }}>
                <TableCell sx={{ fontWeight: "bold", color: "grey.900", py: 3 }}>Staff</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "grey.900", py: 3 }}>Details</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "grey.900", py: 3 }}>Schedule</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "grey.900", py: 3 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "grey.900", py: 3 }}>Salary</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "grey.900", py: 3 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "grey.600" }}>
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredStaff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "grey.600" }}>
                    No staff found
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filteredStaff.map((staff, index) => (
                  <TableRow
                    key={staff._id}
                    sx={{
                      bgcolor: index % 2 === 0 ? "white" : "grey.50",
                      "&:hover": { bgcolor: "indigo.50", transition: "background 0.2s ease" },
                    }}
                  >
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                        {staff.image && (
                          <img
                            src={staff.image}
                            alt={staff.name}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid",
                              borderColor: "indigo.200",
                            }}
                          />
                        )}
                        <Box>
                          <Typography sx={{ fontWeight: "medium", color: "grey.900" }}>
                            {staff.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "grey.600" }}>
                            {staff.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <Chip
                          label={staff.role}
                          size="small"
                          sx={{ bgcolor: "indigo.100", color: "indigo.800", fontWeight: "medium" }}
                        />
                        <Chip
                          label={staff.department}
                          size="small"
                          sx={{ bgcolor: "teal.100", color: "teal.800", fontWeight: "medium" }}
                        />
                        {staff.gender && (
                          <Chip
                            label={staff.gender}
                            size="small"
                            sx={{ bgcolor: "purple.100", color: "purple.800", fontWeight: "medium" }}
                          />
                        )}
                        <Typography variant="body2" sx={{ color: "grey.600" }}>
                          {staff.phone}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "grey.600" }}>
                          Joined: {staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : "-"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {staff.shiftSchedule.map((schedule) => (
                          <Chip
                            key={schedule.day}
                            label={`${schedule.day}: ${schedule.timeSlots[0].start}-${schedule.timeSlots[0].end}`}
                            size="small"
                            sx={{ bgcolor: "blue.100", color: "blue.800", fontWeight: "medium" }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Chip
                        label={staff.status}
                        color={getStatusColor(staff.status)}
                        size="small"
                        sx={{ fontWeight: "medium" }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Box>
                        <Typography sx={{ color: "grey.900" }}>₹{staff.salary.toLocaleString()}</Typography>
                        <Typography variant="body2" sx={{ color: "grey.600" }}>
                          Due: {staff.salaryDueDate ? new Date(staff.salaryDueDate).toLocaleDateString() : "-"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleEdit(staff)}
                          sx={{ color: "indigo.600", "&:hover": { color: "indigo.800" } }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(staff._id)}
                          sx={{ color: "red.600", "&:hover": { color: "red.800" } }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="lg"
          sx={{ "& .MuiDialog-paper": { borderRadius: 3, boxShadow: "0 8px 40px rgba(0, 0, 0, 0.2)" } }}
        >
          <DialogTitle sx={{ bgcolor: "indigo.50", color: "indigo.900", fontWeight: "bold", py: 3 }}>
            {editingId ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
          <DialogContent dividers sx={{ bgcolor: "grey.50", py: 4 }}>
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" sx={{ mb: 3, color: "grey.800", fontWeight: "medium" }}>
                Personal Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  >
                    <InputLabel>Gender</InputLabel>
                    <Select name="gender" value={form.gender} onChange={handleChange} label="Gender">
                      {genders.map((gender) => (
                        <MenuItem key={gender} value={gender}>
                          {gender}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    variant="outlined"
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Profile Image URL"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 6 }} />
              <Typography variant="h6" sx={{ mb: 3, color: "grey.800", fontWeight: "medium" }}>
                Employment Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    required
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  >
                    <InputLabel>Role</InputLabel>
                    <Select name="role" value={form.role} onChange={handleChange} label="Role">
                      {roles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    required
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  >
                    <InputLabel>Department</InputLabel>
                    <Select name="department" value={form.department} onChange={handleChange} label="Department">
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    required
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  >
                    <InputLabel>Status</InputLabel>
                    <Select name="status" value={form.status} onChange={handleChange} label="Status">
                      {statuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Salary"
                    name="salary"
                    type="number"
                    value={form.salary}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 2, color: "grey.600" }}>₹</Typography>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Joining Date"
                    value={form.joiningDate}
                    onChange={(date) => handleDateChange(date, "joiningDate")}
                    renderInput={(params) => (
                      <TextField
                        fullWidth
                        required
                        variant="outlined"
                        sx={{
                          bgcolor: "white",
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": { borderRadius: 2 },
                        }}
                        {...params}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Salary Due Date"
                    value={form.salaryDueDate}
                    onChange={(date) => handleDateChange(date, "salaryDueDate")}
                    renderInput={(params) => (
                      <TextField
                        fullWidth
                        required
                        variant="outlined"
                        sx={{
                          bgcolor: "white",
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": { borderRadius: 2 },
                        }}
                        {...params}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 6 }} />
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, color: "grey.800", fontWeight: "medium" }}
              >
                <Schedule sx={{ color: "indigo.600" }} />
                Shift Schedule
              </Typography>
              <Grid container spacing={4}>
                {weekdays.map((day) => {
                  const daySchedule = form.shiftSchedule.find((s) => s.day === day);
                  const startTime = daySchedule?.timeSlots[0]?.start || "09:00";
                  const endTime = daySchedule?.timeSlots[0]?.end || "17:00";

                  return (
                    <Grid item xs={12} sm={6} md={4} key={day}>
                      <Paper
                        sx={{
                          p: 4,
                          borderRadius: 3,
                          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                          bgcolor: "white",
                          transition: "all 0.3s ease",
                          "&:hover": { boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)" },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: "medium", color: "grey.900" }}>
                            {day}
                          </Typography>
                          <Switch
                            checked={dayToggles[day]}
                            onChange={() => handleDayToggle(day)}
                            color="primary"
                            sx={{ "& .MuiSwitch-track": { bgcolor: "indigo.200" } }}
                          />
                        </Box>
                        {dayToggles[day] && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <TextField
                              type="time"
                              label="Start"
                              InputLabelProps={{ shrink: true }}
                              value={startTime}
                              onChange={(e) => handleShiftChange(day, "start", e.target.value)}
                              fullWidth
                              variant="outlined"
                              sx={{
                                bgcolor: "white",
                                borderRadius: 2,
                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                              }}
                            />
                            <Typography sx={{ color: "grey.600" }}>to</Typography>
                            <TextField
                              type="time"
                              label="End"
                              InputLabelProps={{ shrink: true }}
                              value={endTime}
                              onChange={(e) => handleShiftChange(day, "end", e.target.value)}
                              fullWidth
                              variant="outlined"
                              sx={{
                                bgcolor: "white",
                                borderRadius: 2,
                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                              }}
                            />
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              <Divider sx={{ my: 6 }} />
              <Typography variant="h6" sx={{ mb: 3, color: "grey.800", fontWeight: "medium" }}>
                Additional Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions sx={{ bgcolor: "indigo.50", py: 3 }}>
            <Button
              onClick={handleCloseDialog}
              startIcon={<Cancel />}
              sx={{
                color: "grey.700",
                "&:hover": { bgcolor: "grey.200" },
                borderRadius: 2,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<Save />}
              disabled={loading}
              sx={{
                bgcolor: "indigo.600",
                "&:hover": { bgcolor: "indigo.700" },
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: "medium",
                transition: "all 0.3s ease",
              }}
            >
              {editingId ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Staff;