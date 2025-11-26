import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserHeader } from "@/components/UserHeader";
import { submitStudentPrediction } from "@/services/api";
import { StudentFormData } from "@/types/student";
import { Loader2, TrendingUp } from "lucide-react";

const StudentForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  const [formData, setFormData] = useState<StudentFormData>({
    studentName: "",
    enrollmentNumber: "",
    midsem1Marks: 0,
    midsem2Marks: 0,
    comprehensiveExamMarks: 0,
    attendancePercentage: 0,
    studyHoursPerWeek: 0,
    totalBacklogs: 0,
    hasPartTimeJob: "no",
    currentGPA: 0,
    gender: "male",
    age: 18,
  });

  const handleInputChange = (field: keyof StudentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const prediction = await submitStudentPrediction(formData);
      
      toast({
        title: "Prediction Generated",
        description: "Redirecting to results...",
      });

      // Store prediction in sessionStorage and navigate
      sessionStorage.setItem("predictionResult", JSON.stringify(prediction));
      navigate("/prediction-results");
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8 relative">
      <UserHeader />
      
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold">Performance Forecasting</h1>
              <p className="text-muted-foreground">Faculty Dashboard</p>
            </div>
          </div>
        </div>

        <main>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Student Data Input Form</CardTitle>
            <CardDescription className="text-base">
              Enter student information to generate performance prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Identity */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input
                    id="studentName"
                    placeholder="Full name"
                    value={formData.studentName}
                    onChange={(e) => handleInputChange("studentName", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollmentNumber">Enrollment Number *</Label>
                  <Input
                    id="enrollmentNumber"
                    placeholder="e.g., 2021CS001"
                    value={formData.enrollmentNumber}
                    onChange={(e) => handleInputChange("enrollmentNumber", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Academic Performance */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Academic Performance</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="midsem1Marks">Midsem 1 Marks (Avg) *</Label>
                    <Input
                      id="midsem1Marks"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.midsem1Marks}
                      onChange={(e) => handleInputChange("midsem1Marks", Number(e.target.value))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="midsem2Marks">Midsem 2 Marks (Avg) *</Label>
                    <Input
                      id="midsem2Marks"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.midsem2Marks}
                      onChange={(e) => handleInputChange("midsem2Marks", Number(e.target.value))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comprehensiveExamMarks">Comprehensive Exam (Avg) *</Label>
                    <Input
                      id="comprehensiveExamMarks"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.comprehensiveExamMarks}
                      onChange={(e) => handleInputChange("comprehensiveExamMarks", Number(e.target.value))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentGPA">Current GPA (out of 10) *</Label>
                    <Input
                      id="currentGPA"
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      value={formData.currentGPA}
                      onChange={(e) => handleInputChange("currentGPA", Number(e.target.value))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalBacklogs">Total Backlogs *</Label>
                    <Input
                      id="totalBacklogs"
                      type="number"
                      min="0"
                      value={formData.totalBacklogs}
                      onChange={(e) => handleInputChange("totalBacklogs", Number(e.target.value))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Attendance & Study Habits */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Attendance & Study Habits</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attendancePercentage">Past Semester Attendance (%) *</Label>
                    <Input
                      id="attendancePercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.attendancePercentage}
                      onChange={(e) => handleInputChange("attendancePercentage", Number(e.target.value))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studyHoursPerWeek">Study Hours Per Week *</Label>
                    <Input
                      id="studyHoursPerWeek"
                      type="number"
                      min="0"
                      max="168"
                      value={formData.studyHoursPerWeek}
                      onChange={(e) => handleInputChange("studyHoursPerWeek", Number(e.target.value))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="16"
                      max="100"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", Number(e.target.value))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hasPartTimeJob">Has Part-Time Job? *</Label>
                    <Select
                      value={formData.hasPartTimeJob}
                      onValueChange={(value) => handleInputChange("hasPartTimeJob", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="hasPartTimeJob">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Prediction...
                  </>
                ) : (
                  "Predict Performance"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      </div>
    </div>
  );
};

export default StudentForm;
