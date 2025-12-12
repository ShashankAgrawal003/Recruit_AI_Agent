import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  MessageCircle,
  Bot,
  User,
  Clock,
  Check,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Candidate } from "@/lib/mockData";

interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
}

interface ScreeningChatProps {
  candidate: Candidate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "system",
    content: "Screening session started",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    type: "ai",
    content: "Hello! I'm your AI screening assistant. I've analyzed the candidate's resume and prepared some relevant questions. Would you like me to suggest screening questions based on their profile?",
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
];

export function ScreeningChat({ candidate, open, onOpenChange }: ScreeningChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: getAiResponse(inputValue, candidate),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const suggestedQuestions = [
    "Tell me about your experience with React",
    "What's your approach to system design?",
    "Describe a challenging project you led",
    "What are your salary expectations?",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                {candidate.initials}
              </div>
              <div>
                <DialogTitle className="text-base">{candidate.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{candidate.role}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <MessageCircle className="h-3 w-3 mr-1" />
              Screening
            </Badge>
          </div>
        </DialogHeader>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted/50 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => setInputValue(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message or note..."
              className="flex-1"
            />
            <Button type="submit" className="btn-gradient gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChatMessage({ message }: { message: Message }) {
  if (message.type === "system") {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          {message.content} • {formatTime(message.timestamp)}
        </span>
      </div>
    );
  }

  const isUser = message.type === "user";

  return (
    <div className={cn("flex items-start gap-2", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-primary" : "bg-primary/10"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted/50"
        )}
      >
        <p className="text-sm">{message.content}</p>
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <span className={cn("text-xs", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {formatTime(message.timestamp)}
          </span>
          {isUser && message.status && (
            <span className="text-primary-foreground/70">
              {message.status === "read" ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getAiResponse(input: string, candidate: Candidate): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes("suggest") || lowerInput.includes("question")) {
    return `Based on ${candidate.name}'s profile, here are some targeted questions:\n\n1. "Can you walk me through your experience with ${candidate.skills[0]}?"\n2. "How did you handle ${candidate.role.toLowerCase()} responsibilities at your previous role?"\n3. "What's your availability timeline? You mentioned ${candidate.availability}."\n\nWould you like me to elaborate on any of these?`;
  }

  if (lowerInput.includes("salary")) {
    return `${candidate.name}'s salary expectation is ${candidate.salaryExpectation}. This is ${parseInt(candidate.salaryExpectation.replace(/\D/g, "")) > 150000 ? "above" : "within"} our typical range for this role. I recommend discussing flexibility during the interview.`;
  }

  if (lowerInput.includes("strength") || lowerInput.includes("strong")) {
    return `Key strengths identified for ${candidate.name}:\n\n• ${candidate.strengths.join("\n• ")}\n\nTheir base score is ${candidate.baseScore}% with a weighted score of ${candidate.weightedScore}%.`;
  }

  if (lowerInput.includes("concern") || lowerInput.includes("flag") || lowerInput.includes("gap")) {
    const gaps = candidate.skillGaps.filter((g) => g.status !== "Fully Met");
    return `Potential areas to explore:\n\n${gaps.map((g) => `• ${g.skill}: ${g.note}`).join("\n")}\n\n${candidate.flags.length > 0 ? `Flags: ${candidate.flags.join(", ")}` : "No major flags identified."}`;
  }

  return `I've noted that question about ${candidate.name}. Based on their profile as a ${candidate.role} with ${candidate.skills.length} key skills listed, they appear to be a ${candidate.scoreLevel.toLowerCase()} match at ${candidate.weightedScore}%. Would you like me to provide more specific insights?`;
}
