import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  FileText,
  Bell,
  Search,
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  Download,
  LogOut,
  Settings,
  Moon,
  Sun,
  Menu,
  Mail,
  Sparkles,
  ExternalLink,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScholarshipTimer } from "@/components/ScholarshipTimer";
import { QuizDialog } from "@/components/QuizDialog";

type TabType = "Deadlines" | "Alerts" | "Documents" | "Important Emails";

interface LiveNotification {
  id: string;
  sender: string;
  subject: string;
  timestamp: number;
  isRead: boolean;
}

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("Deadlines");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEmailForSummary, setSelectedEmailForSummary] = useState<Id<"emails"> | null>(null);
  const [emailSummary, setEmailSummary] = useState<{ summary: string; keyPoints: string[] } | null>(null);
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [liveAlertsFeed, setLiveAlertsFeed] = useState<Array<{
    id: string;
    type: "alert" | "email";
    course: string;
    importance: "URGENT" | "HIGH" | "MEDIUM";
    message: string;
    timestamp: string;
  }>>([]);

  const [selectedQuizId, setSelectedQuizId] = useState<Id<"quizzes"> | null>(null);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);

  const deadlines = useQuery(api.deadlines.list, { filter: filter === "All" ? undefined : filter });
  const alerts = useQuery(api.alerts.list);
  const emails = useQuery(api.emails.list);
  const importantEmails = useQuery(api.emails.listImportant);
  const documents = useQuery(api.documents.list);
  const courses = useQuery(api.courses.list);
  const quizzes = useQuery(api.quizzes.list);
  const scholarships = useQuery(api.scholarships.list);

  const toggleComplete = useMutation(api.deadlines.toggleComplete);
  const markAlertAsRead = useMutation(api.alerts.markAsRead);
  const markEmailAsRead = useMutation(api.emails.markAsRead);
  const seedData = useMutation(api.seed.seedData);
  const markSyncedToCalendar = useMutation(api.deadlines.markSyncedToCalendar);
  const generateSummary = useMutation(api.emails.generateSummary);
  const submitQuiz = useMutation(api.quizzes.submitQuiz);
  const getQuizWithQuestions = useQuery(
    api.quizzes.getQuizWithQuestions,
    selectedQuizId ? { quizId: selectedQuizId } : "skip"
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Live Notification Simulation (for bell icon)
  useEffect(() => {
    const senders = [
      "Prof. Smith",
      "Prof. Johnson",
      "Google Classroom",
      "Prof. Kumar",
      "Dr. Patel",
      "Academic Office",
      "Library Services",
      "Prof. Williams",
      "Dean's Office",
      "Student Portal"
    ];

    const subjects = [
      "Assignment Graded",
      "New Announcement",
      "Class Cancelled",
      "Quiz Posted",
      "Deadline Reminder",
      "New Material Uploaded",
      "Office Hours Changed",
      "Exam Schedule Updated",
      "Project Feedback Available",
      "Important Notice"
    ];

    const generateNotification = (): LiveNotification => {
      return {
        id: `notif-${Date.now()}-${Math.random()}`,
        sender: senders[Math.floor(Math.random() * senders.length)],
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        timestamp: Date.now(),
        isRead: false,
      };
    };

    const interval = setInterval(() => {
      const newNotif = generateNotification();
      setLiveNotifications((prev) => [newNotif, ...prev].slice(0, 20));
    }, 5000);

    setLiveNotifications([generateNotification()]);

    return () => clearInterval(interval);
  }, []);

  // Live Alerts Feed Simulation (for Alerts section)
  useEffect(() => {
    const courses = ["CS201", "CS302", "CS303", "CS304", "CS401", "General"];
    const importanceLevels: Array<"URGENT" | "HIGH" | "MEDIUM"> = ["URGENT", "HIGH", "MEDIUM"];
    
    const alertMessages = [
      "Class cancelled: Operating Systems Lab moved to next week",
      "Building maintenance: Classes moved to Building B",
      "Room changed: Lecture moved to Room 305",
      "Quiz postponed: New date will be announced",
      "Extra class scheduled for tomorrow at 3 PM",
      "Lab session rescheduled to Friday",
      "Guest lecture today at 4 PM in Auditorium",
      "Assignment deadline extended by 2 days",
      "Midterm exam schedule updated",
      "Project presentation moved to next Monday"
    ];

    const emailMessages = [
      "Important: Fee payment reminder for Fall semester",
      "Scholarship application deadline approaching",
      "Library book return reminder",
      "Internship opportunity notification",
      "Campus event invitation",
      "Research paper submission guidelines",
      "Career fair registration open",
      "Student council election notice",
      "Hostel allocation update",
      "Sports tournament registration"
    ];

    const generateLiveAlert = () => {
      const isAlert = Math.random() > 0.5;
      const course = courses[Math.floor(Math.random() * courses.length)];
      const importance = importanceLevels[Math.floor(Math.random() * importanceLevels.length)];
      const messages = isAlert ? alertMessages : emailMessages;
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      return {
        id: `live-${Date.now()}-${Math.random()}`,
        type: isAlert ? "alert" as const : "email" as const,
        course,
        importance,
        message,
        timestamp,
      };
    };

    // Initial alerts
    const initialAlerts = Array.from({ length: 5 }, () => generateLiveAlert());
    setLiveAlertsFeed(initialAlerts);

    // Push new alerts every 2 seconds
    const interval = setInterval(() => {
      const newAlert = generateLiveAlert();
      setLiveAlertsFeed((prev) => [newAlert, ...prev].slice(0, 15));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const markNotificationAsRead = (id: string) => {
    setLiveNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const unreadCount = liveNotifications.filter((n) => !n.isRead).length;

  const handleSeedData = async () => {
    try {
      await seedData({});
      toast.success("Sample data loaded successfully!");
    } catch (error) {
      toast.error("Failed to load sample data");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleAddToCalendar = async (deadline: any) => {
    try {
      const course = courses?.find(c => c._id === deadline.courseId);
      const dueDate = new Date(deadline.dueDate);
      
      const calendarUrl = generateGoogleCalendarUrl({
        title: `${course?.code || 'Course'}: ${deadline.title}`,
        description: deadline.description || '',
        startDate: dueDate,
        location: course?.name || '',
      });
      
      await markSyncedToCalendar({ id: deadline._id });
      window.open(calendarUrl, '_blank');
      toast.success("Opening Google Calendar...");
    } catch (error) {
      toast.error("Failed to add to calendar");
    }
  };

  const handleSummarizeEmail = async (emailId: Id<"emails">) => {
    try {
      setSelectedEmailForSummary(emailId);
      const result = await generateSummary({ id: emailId });
      setEmailSummary(result);
      toast.success("Email summarized!");
    } catch (error) {
      toast.error("Failed to summarize email");
    }
  };

  const formatTimeUntil = (dueDate: number) => {
    const now = Date.now();
    const diff = dueDate - now;
    
    if (diff < 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getPriorityColor = (dueDate: number) => {
    const now = Date.now();
    const diff = dueDate - now;
    
    if (diff < 24 * 60 * 60 * 1000) return "text-red-500";
    if (diff < 3 * 24 * 60 * 60 * 1000) return "text-yellow-500";
    return "text-green-500";
  };

  const handleStartQuiz = async (quiz: any) => {
    setSelectedQuizId(quiz._id);
    // Small delay to ensure the query runs before opening dialog
    setTimeout(() => {
      setQuizDialogOpen(true);
    }, 100);
  };

  const handleQuizSubmit = async (answers: number[]) => {
    if (!selectedQuizId) return;
    
    try {
      const result = await submitQuiz({
        quizId: selectedQuizId,
        answers,
      });
      toast.success(`Quiz completed! Score: ${result.score}/${result.totalPoints}`);
      setSelectedQuizId(null);
    } catch (error) {
      toast.error("Failed to submit quiz");
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const combinedFeed = [
    ...(alerts || []).map((a) => ({ ...a, type: "alert" as const })),
    ...(emails || []).map((e) => ({ ...e, type: "email" as const })),
  ].sort((a, b) => {
    const timeA = "timestamp" in a ? a.timestamp : Date.now();
    const timeB = "timestamp" in b ? b.timestamp : Date.now();
    return timeB - timeA;
  });

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎓</span>
                  <span className="font-semibold text-lg hidden sm:inline">Collegiate Inbox</span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant={activeTab === "Deadlines" ? "default" : "ghost"}
                  onClick={() => setActiveTab("Deadlines")}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Deadlines
                </Button>
                <Button
                  variant={activeTab === "Alerts" ? "default" : "ghost"}
                  onClick={() => setActiveTab("Alerts")}
                  className="gap-2"
                >
                  <Bell className="h-4 w-4" />
                  Alerts
                </Button>
                <Button
                  variant={activeTab === "Important Emails" ? "default" : "ghost"}
                  onClick={() => setActiveTab("Important Emails")}
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Important Emails
                </Button>
                <Button
                  variant={activeTab === "Documents" ? "default" : "ghost"}
                  onClick={() => setActiveTab("Documents")}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Documents
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Live Notification Bell */}
                <DropdownMenu open={notificationDropdownOpen} onOpenChange={setNotificationDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                    <div className="p-2 font-semibold border-b">Live Notifications</div>
                    {liveNotifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      <AnimatePresence>
                        {liveNotifications.map((notif) => (
                          <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.2 }}
                          >
                            <DropdownMenuItem
                              className={`flex items-start gap-2 p-3 cursor-default ${
                                !notif.isRead ? "bg-blue-50 dark:bg-blue-950/30" : ""
                              }`}
                              onSelect={(e) => e.preventDefault()}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="font-semibold text-sm truncate">{notif.sender}</p>
                                  {!notif.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 shrink-0"
                                      onClick={() => markNotificationAsRead(notif.id)}
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">{notif.subject}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(notif.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </DropdownMenuItem>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="font-medium hidden lg:inline">{user?.name?.split(" ")[0]}</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64 bg-card border-r border-border p-6 transition-transform lg:translate-x-0 z-40 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user?.name || "User"}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Filters</p>
                {["All", "Today", "This Week"].map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </Button>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-auto pt-6 border-t border-border">
                <Button variant="ghost" className="justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          {/* Backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search deadlines, emails, or courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 h-12"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
              {(["Deadlines", "Alerts", "Important Emails", "Documents"] as TabType[]).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  onClick={() => setActiveTab(tab)}
                  className="whitespace-nowrap"
                >
                  {tab}
                </Button>
              ))}
            </div>

            {/* Load Sample Data Button */}
            {(!deadlines || deadlines.length === 0) && (
              <Card className="p-6 mb-6 text-center">
                <p className="text-muted-foreground mb-4">No data yet. Load sample data to get started!</p>
                <Button onClick={handleSeedData}>Load Sample Data</Button>
              </Card>
            )}

            {/* Content Sections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "Deadlines" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Upcoming Deadlines</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {deadlines?.map((deadline) => (
                      <Card key={deadline._id} className="p-6 border-t-4" style={{ borderTopColor: courses?.find(c => c._id === deadline.courseId)?.color || "#4F46E5" }}>
                        <div className="flex items-start justify-between mb-3">
                          <span
                            className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
                            style={{ backgroundColor: courses?.find(c => c._id === deadline.courseId)?.color || "#4F46E5" }}
                          >
                            {courses?.find(c => c._id === deadline.courseId)?.code || "N/A"}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleComplete({ id: deadline._id })}
                          >
                            <CheckCircle2 className={`h-5 w-5 ${deadline.isCompleted ? "text-green-500" : "text-muted-foreground"}`} />
                          </Button>
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2">{deadline.title}</h3>
                        <div className={`flex items-center gap-2 mb-3 font-semibold ${getPriorityColor(deadline.dueDate)}`}>
                          <Clock className="h-4 w-4" />
                          <span>{formatTimeUntil(deadline.dueDate)}</span>
                          <span className="text-sm text-muted-foreground">
                            ({new Date(deadline.dueDate).toLocaleDateString()})
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {deadline.description}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 gap-2"
                            onClick={() => handleAddToCalendar(deadline)}
                          >
                            <Calendar className="h-4 w-4" />
                            {deadline.isSyncedToCalendar ? "Added" : "Add to Calendar"}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Alerts" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Alerts & Emails</h2>
                    <span className="text-sm text-muted-foreground">Sorted by Importance</span>
                  </div>
                  
                  {/* Live Notifications Feed */}
                  <Card className="mb-8 overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                    <div className="p-4 border-b bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <h3 className="font-semibold text-lg">Live Notifications Feed</h3>
                      </div>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto">
                      <AnimatePresence>
                        {liveAlertsFeed.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className={`p-4 border-b border-border/50 ${
                              item.importance === "URGENT" 
                                ? "bg-red-50 dark:bg-red-950/20 border-l-4 border-l-red-500" 
                                : item.importance === "HIGH"
                                ? "bg-orange-50 dark:bg-orange-950/20 border-l-4 border-l-orange-500"
                                : "bg-white dark:bg-black/10"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                item.type === "alert" 
                                  ? "bg-red-100 dark:bg-red-950" 
                                  : "bg-blue-100 dark:bg-blue-950"
                              }`}>
                                {item.type === "alert" ? (
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                ) : (
                                  <Mail className="h-5 w-5 text-blue-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge 
                                    variant="outline" 
                                    className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300"
                                  >
                                    {item.course}
                                  </Badge>
                                  <Badge 
                                    variant={item.importance === "URGENT" ? "destructive" : "secondary"}
                                    className={
                                      item.importance === "HIGH" 
                                        ? "bg-orange-500 text-white" 
                                        : item.importance === "MEDIUM"
                                        ? "bg-yellow-500 text-white"
                                        : ""
                                    }
                                  >
                                    {item.importance}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium mb-1">{item.message}</p>
                                <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </Card>

                  <h3 className="text-xl font-semibold mb-4">All Alerts & Emails</h3>
                  <div className="flex flex-col gap-4">
                    {combinedFeed.map((item, idx) => (
                      <Card key={idx} className="p-6 border-l-4" style={{ borderLeftColor: item.type === "alert" ? "#EF4444" : "#4F46E5" }}>
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${item.type === "alert" ? "bg-red-100 dark:bg-red-950" : "bg-blue-100 dark:bg-blue-950"}`}>
                            {item.type === "alert" ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Bell className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">
                              {item.type === "alert" ? item.title : item.subject}
                            </h3>
                            {"from" in item && (
                              <p className="text-sm text-muted-foreground mb-2">From: {item.from}</p>
                            )}
                            <p className="text-sm text-muted-foreground mb-3">{item.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {"timestamp" in item && new Date(item.timestamp).toLocaleString()}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (item.type === "alert" && "_id" in item) {
                                    markAlertAsRead({ id: item._id as Id<"alerts"> });
                                  }
                                }}
                              >
                                {item.isRead ? "Mark Unread" : "Mark as Read"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Important Emails" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Mailbox</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      <span>AI-Powered Summaries</span>
                    </div>
                  </div>
                  
                  {/* Email Categories */}
                  {emails && emails.length > 0 ? (
                    <div className="space-y-8">
                      {/* Group emails by category */}
                      {["scholarship", "results", "exam_timetable", "class_timetable", "classes", "notice", "general"].map((category) => {
                        const categoryEmails = emails.filter(e => e.category === category);
                        if (categoryEmails.length === 0) return null;
                        
                        const categoryLabels: Record<string, { title: string; color: string; icon: string }> = {
                          scholarship: { title: "Scholarships", color: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400", icon: "💰" },
                          results: { title: "Results", color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400", icon: "📊" },
                          exam_timetable: { title: "Exam Timetable", color: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400", icon: "📅" },
                          class_timetable: { title: "Class Timetable", color: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400", icon: "🗓️" },
                          classes: { title: "Classes", color: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400", icon: "📚" },
                          notice: { title: "Notices", color: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400", icon: "📢" },
                          general: { title: "General", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400", icon: "📧" },
                        };
                        
                        const categoryInfo = categoryLabels[category];
                        
                        return (
                          <div key={category}>
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-2xl">{categoryInfo.icon}</span>
                              <h3 className="text-xl font-semibold">{categoryInfo.title}</h3>
                              <Badge className={categoryInfo.color}>{categoryEmails.length}</Badge>
                            </div>
                            
                            {/* Group by course within category */}
                            {courses && (() => {
                              const emailsByCourse: Record<string, typeof categoryEmails> = {};
                              const emailsWithoutCourse: typeof categoryEmails = [];
                              
                              categoryEmails.forEach(email => {
                                if (email.courseId) {
                                  const course = courses.find(c => c._id === email.courseId);
                                  const courseKey = course?.code || "Unknown";
                                  if (!emailsByCourse[courseKey]) {
                                    emailsByCourse[courseKey] = [];
                                  }
                                  emailsByCourse[courseKey].push(email);
                                } else {
                                  emailsWithoutCourse.push(email);
                                }
                              });
                              
                              return (
                                <div className="space-y-6">
                                  {Object.entries(emailsByCourse).map(([courseCode, courseEmails]) => {
                                    const course = courses.find(c => c.code === courseCode);
                                    return (
                                      <div key={courseCode}>
                                        <div className="flex items-center gap-2 mb-3 ml-4">
                                          <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: course?.color || "#6B7280" }}
                                          />
                                          <span className="font-semibold text-sm">{courseCode}</span>
                                          <span className="text-xs text-muted-foreground">({courseEmails.length})</span>
                                        </div>
                                        <div className="flex flex-col gap-3 ml-8">
                                          {courseEmails.map((email) => (
                                            <Card key={email._id} className="p-4 border-l-4" style={{ borderLeftColor: course?.color || "#6B7280" }}>
                                              <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                                                  <Mail className="h-4 w-4 text-purple-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-start justify-between mb-1">
                                                    <div className="flex-1">
                                                      <h4 className="font-semibold text-sm mb-1">{email.subject}</h4>
                                                      <p className="text-xs text-muted-foreground mb-2">From: {email.from}</p>
                                                    </div>
                                                    {!email.isRead && (
                                                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs rounded-full ml-2">
                                                        New
                                                      </span>
                                                    )}
                                                  </div>
                                                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{email.message}</p>
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">
                                                      {new Date(email.timestamp).toLocaleString()}
                                                    </span>
                                                    <div className="flex gap-2">
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => markEmailAsRead({ id: email._id })}
                                                      >
                                                        {email.isRead ? "Mark Unread" : "Mark as Read"}
                                                      </Button>
                                                      <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => handleSummarizeEmail(email._id)}
                                                      >
                                                        <Sparkles className="h-3 w-3" />
                                                        Summarize
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </Card>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  
                                  {emailsWithoutCourse.length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-2 mb-3 ml-4">
                                        <span className="font-semibold text-sm">General</span>
                                        <span className="text-xs text-muted-foreground">({emailsWithoutCourse.length})</span>
                                      </div>
                                      <div className="flex flex-col gap-3 ml-8">
                                        {emailsWithoutCourse.map((email) => (
                                          <Card key={email._id} className="p-4 border-l-4 border-l-gray-400">
                                            <div className="flex items-start gap-3">
                                              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                                                <Mail className="h-4 w-4 text-purple-500" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                  <div className="flex-1">
                                                    <h4 className="font-semibold text-sm mb-1">{email.subject}</h4>
                                                    <p className="text-xs text-muted-foreground mb-2">From: {email.from}</p>
                                                  </div>
                                                  {!email.isRead && (
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs rounded-full ml-2">
                                                      New
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{email.message}</p>
                                                <div className="flex items-center justify-between">
                                                  <span className="text-xs text-muted-foreground">
                                                    {new Date(email.timestamp).toLocaleString()}
                                                  </span>
                                                  <div className="flex gap-2">
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() => markEmailAsRead({ id: email._id })}
                                                    >
                                                      {email.isRead ? "Mark Unread" : "Mark as Read"}
                                                    </Button>
                                                    <Button
                                                      variant="default"
                                                      size="sm"
                                                      className="gap-2"
                                                      onClick={() => handleSummarizeEmail(email._id)}
                                                    >
                                                      <Sparkles className="h-3 w-3" />
                                                      Summarize
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </Card>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="p-12 text-center">
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No emails at the moment</p>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "Documents" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Key Documents & Quizzes</h2>
                  <div className="flex flex-col gap-4">
                    {documents?.map((docGroup) => {
                      // Find the course for this document group
                      const course = courses?.find(c => c.code === docGroup.course_code);
                      const courseQuizzes = quizzes?.filter(q => q.courseId === course?._id) || [];
                      
                      return (
                        <Card key={docGroup.course_code} className="overflow-hidden">
                          <div className="p-4 bg-muted font-semibold flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              {docGroup.course}
                            </div>
                            {(() => {
                              const course = courses?.find(c => c.code === docGroup.course_code);
                              const courseQuizzes = quizzes?.filter(q => q.courseId === course?._id) || [];
                              const availableQuiz = courseQuizzes.find(q => !q.isCompleted);
                              
                              return availableQuiz ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleStartQuiz(availableQuiz)}
                                  className="gap-2"
                                >
                                  <Sparkles className="h-4 w-4" />
                                  Start Quiz
                                </Button>
                              ) : null;
                            })()}
                          </div>
                          <div className="p-4 flex flex-col gap-2">
                            {docGroup.items.map((doc: any) => (
                              <div key={doc._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border-b last:border-b-0">
                                <div className="flex items-center gap-3 flex-1">
                                  <FileText className="h-5 w-5 text-primary" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{doc.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {doc.date} • {doc.size}
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 150
>>
stream
BT
/F1 18 Tf
50 750 Td
(${doc.name}) Tj
0 -30 Td
/F1 12 Tf
(Course: ${docGroup.course}) Tj
0 -20 Td
(Date: ${doc.date}) Tj
0 -20 Td
(Size: ${doc.size}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
520
%%EOF`;
                                    const blob = new Blob([pdfContent], { type: 'application/pdf' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = doc.name;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    window.URL.revokeObjectURL(url);
                                    toast.success(`Downloading ${doc.name}`);
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            
                            {/* Quiz buttons for this course */}
                            {courseQuizzes.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-purple-500" />
                                  Available Quizzes
                                </h4>
                                <div className="grid gap-2">
                                  {courseQuizzes.map((quiz) => (
                                    <Button
                                      key={quiz._id}
                                      variant={quiz.isCompleted ? "outline" : "default"}
                                      className="w-full justify-between gap-2 h-auto py-3"
                                      disabled={quiz.isCompleted}
                                      onClick={() => handleStartQuiz(quiz)}
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        <FileText className="h-4 w-4" />
                                        <div className="text-left flex-1">
                                          <p className="font-medium text-sm">{quiz.title}</p>
                                          <p className="text-xs opacity-80">
                                            {quiz.duration} min • {quiz.totalQuestions} questions
                                            {quiz.isCompleted && quiz.score !== undefined && (
                                              <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                                                Score: {quiz.score}%
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                      {quiz.isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                      ) : (
                                        <span className="text-xs font-semibold">Start Quiz →</span>
                                      )}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {/* Scholarship Section */}
                  {scholarships && scholarships.length > 0 && (
                    <div className="mt-12">
                      <h2 className="text-2xl font-semibold mb-6">Scholarship Deadlines</h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {scholarships.map((scholarship) => (
                          <Card key={scholarship._id} className="p-6 border-l-4 border-l-yellow-500">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg">{scholarship.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Amount: ${scholarship.amount.toLocaleString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                scholarship.status === "awarded" 
                                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                              }`}>
                                {scholarship.status}
                              </span>
                            </div>
                            {scholarship.awardedDate && (
                              <ScholarshipTimer 
                                deadline={scholarship.awardedDate} 
                                name={scholarship.name}
                              />
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </main>
        </div>

        {/* Email Summary Dialog */}
        <Dialog open={selectedEmailForSummary !== null} onOpenChange={(open) => !open && setSelectedEmailForSummary(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Email Summary
              </DialogTitle>
              <DialogDescription>
                Quick overview of the email content
              </DialogDescription>
            </DialogHeader>
            {emailSummary && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">{emailSummary.summary}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Points</h4>
                  <ul className="space-y-1">
                    {emailSummary.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Quiz Dialog */}
        {quizDialogOpen && getQuizWithQuestions && (
          <QuizDialog
            open={quizDialogOpen}
            onOpenChange={(open) => {
              setQuizDialogOpen(open);
              if (!open) {
                setSelectedQuizId(null);
              }
            }}
            quiz={getQuizWithQuestions}
            onSubmit={handleQuizSubmit}
          />
        )}
      </div>
    </div>
  );
}