import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserHeader } from "@/components/UserHeader";
import { PredictionResponse } from "@/types/student";
import { AlertCircle, ArrowLeft, TrendingUp, User, Award, AlertTriangle, CheckCircle } from "lucide-react";

const PredictionResults = () => {
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  useEffect(() => {
    const storedPrediction = sessionStorage.getItem("predictionResult");
    if (storedPrediction) {
      setPrediction(JSON.parse(storedPrediction));
    } else {
      // Mock data for preview
      setPrediction({
        studentName: "John Doe",
        enrollmentNumber: "2021CS001",
        predictedGPA: 8.2,
        academicRiskLevel: "medium",
        recommendations: [
          "Increase study hours by 5 hours per week",
          "Focus on improving attendance to above 85%",
          "Seek help from tutors for subjects with lower marks",
          "Consider reducing part-time work hours if possible",
        ],
      });
    }
  }, [navigate]);

  if (!prediction) {
    return null;
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-success";
      case "medium":
        return "text-warning";
      case "high":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return <CheckCircle className="w-6 h-6" />;
      case "medium":
        return <AlertCircle className="w-6 h-6" />;
      case "high":
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "low":
        return "default";
      case "medium":
        return "secondary";
      case "high":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleNewPrediction = () => {
    sessionStorage.removeItem("predictionResult");
    navigate("/student-form");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8 relative">
      <UserHeader />
      
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Prediction Results</h1>
              <p className="text-muted-foreground">AI-Powered Analysis</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleNewPrediction}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Prediction
          </Button>
        </div>

        <main>
        <div className="space-y-6">
          {/* Student Info Card */}
          <Card className="shadow-lg border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{prediction.studentName}</CardTitle>
                  <CardDescription className="text-base">
                    Enrollment: {prediction.enrollmentNumber}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Main Prediction Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Predicted GPA Card */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Predicted GPA</CardTitle>
                  <Award className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-5xl font-bold text-primary">
                    {prediction.predictedGPA.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">out of 10.0</p>
                </div>
              </CardContent>
            </Card>

            {/* Risk Level Card */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Academic Risk Level</CardTitle>
                  <div className={getRiskColor(prediction.academicRiskLevel)}>
                    {getRiskIcon(prediction.academicRiskLevel)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge 
                    variant={getRiskBadgeVariant(prediction.academicRiskLevel)}
                    className="text-lg px-4 py-1.5 uppercase font-semibold"
                  >
                    {prediction.academicRiskLevel} Risk
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {prediction.academicRiskLevel === "low" && 
                      "Student is performing well and likely to maintain good academic standing."}
                    {prediction.academicRiskLevel === "medium" && 
                      "Student may need additional support to maintain academic performance."}
                    {prediction.academicRiskLevel === "high" && 
                      "Student requires immediate intervention and academic counseling."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Card (if available) */}
          {prediction.recommendations && prediction.recommendations.length > 0 && (
            <Card className="shadow-lg border-l-4 border-l-secondary">
              <CardHeader>
                <CardTitle className="text-lg">Recommendations</CardTitle>
                <CardDescription>Suggested actions based on the prediction</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleNewPrediction} size="lg" className="flex-1">
              Predict for Another Student
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.print()}>
              Print Results
            </Button>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default PredictionResults;
