import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: {
    _id: string;
    title: string;
    description?: string;
    duration: number;
    totalQuestions: number;
    questions?: QuizQuestion[];
  };
  onSubmit: (answers: number[]) => Promise<void>;
}

export function QuizDialog({ open, onOpenChange, quiz, onSubmit }: QuizDialogProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentQuestion(0);
      setAnswers([]);
      setTimeLeft(quiz.duration * 60);
    }
  }, [open, quiz.duration]);

  useEffect(() => {
    if (!open || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < (quiz.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(answers);
      onOpenChange(false);
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isTimeRunningOut = timeLeft < 60;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{quiz.title}</DialogTitle>
          {quiz.description && (
            <DialogDescription>{quiz.description}</DialogDescription>
          )}
        </DialogHeader>

        {questions.length > 0 ? (
          <div className="space-y-6">
            {/* Timer and Progress */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className={`h-5 w-5 ${isTimeRunningOut ? "text-red-500 animate-pulse" : "text-primary"}`} />
                <span className={`font-mono text-lg font-semibold ${isTimeRunningOut ? "text-red-500" : ""}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
            </div>

            <Progress value={progress} className="h-2" />

            {isTimeRunningOut && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  Less than 1 minute remaining!
                </span>
              </div>
            )}

            {/* Question */}
            {currentQ && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    {currentQuestion + 1}. {currentQ.question}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {currentQ.points} {currentQ.points === 1 ? "point" : "points"}
                  </span>
                </div>

                <RadioGroup
                  value={answers[currentQuestion]?.toString()}
                  onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                >
                  {currentQ.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || answers.length !== questions.length}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                )}
              </div>
            </div>

            {/* Answer Summary */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Answered Questions:</p>
              <div className="flex flex-wrap gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                      answers[index] !== undefined
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    } ${currentQuestion === index ? "ring-2 ring-ring" : ""}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No questions available for this quiz.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
