import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, FileText, Download, Loader2, ExternalLink } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Footer } from "@/components/footer";
import type { ChatMessage, ChatConversation } from "@shared/schema";

interface ChatResponse {
  conversationId: number;
  message: ChatMessage;
  documentsReferenced?: number[];
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ChatConversation[]>({
    queryKey: ["/api/chat/conversations"],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", "/api/chat/message", {
        message: messageText,
        conversationId: currentConversationId,
      });
      return await response.json() as ChatResponse;
    },
    onSuccess: (data) => {
      setCurrentConversationId(data.conversationId);
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/conversations", data.conversationId, "messages"] 
      });
      setInput("");
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(input);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch("/api/chat/report", {
        method: "POST",
        credentials: "include",
        headers: {
          "Accept": "application/pdf",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medical-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">AI Medical Assistant</h2>
          <p className="text-sm text-muted-foreground mt-1">Chat History</p>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            <Button
              variant={!currentConversationId ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentConversationId(null)}
              data-testid="button-new-chat"
            >
              <Bot className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
            {conversations.map((conv) => (
              <Button
                key={conv.id}
                variant={currentConversationId === conv.id ? "default" : "ghost"}
                className="w-full justify-start text-left"
                onClick={() => setCurrentConversationId(conv.id)}
                data-testid={`button-conversation-${conv.id}`}
              >
                <span className="truncate">{conv.title}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="p-2 border-t">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            data-testid="button-generate-report"
          >
            {isGeneratingReport ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Generate Full Report
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="border-b p-4">
          <h1 className="text-2xl font-semibold">Medical AI Assistant</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions about your medical history, request specific records, or generate comprehensive reports
          </p>
        </div>

        {!currentConversationId && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl space-y-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">How can I help you today?</h2>
                <p className="text-muted-foreground">
                  I can analyze your medical documents and answer questions about your health history
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="hover-elevate active-elevate-2 cursor-pointer" onClick={() => setInput("Did I ever have any surgeries?")}>
                  <CardHeader>
                    <CardTitle className="text-base">Surgery History</CardTitle>
                    <CardDescription>
                      Find out if you've had any surgical procedures
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover-elevate active-elevate-2 cursor-pointer" onClick={() => setInput("What medical tests did I do in 2024?")}>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Tests</CardTitle>
                    <CardDescription>
                      View tests and lab work from a specific time period
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover-elevate active-elevate-2 cursor-pointer" onClick={() => setInput("What medications have I been prescribed?")}>
                  <CardHeader>
                    <CardTitle className="text-base">Medications</CardTitle>
                    <CardDescription>
                      Get a list of all your prescribed medications
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover-elevate active-elevate-2 cursor-pointer" onClick={() => setInput("Summarize my complete medical history")}>
                  <CardHeader>
                    <CardTitle className="text-base">Full Summary</CardTitle>
                    <CardDescription>
                      Comprehensive overview of your medical records
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {messagesLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="max-w-[80%] space-y-2">
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                        data-testid={`message-${message.role}-${message.id}`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "assistant" && message.documentsReferenced && message.documentsReferenced.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center px-2">
                          <span className="text-xs text-muted-foreground">Sources:</span>
                          {message.documentsReferenced.map((docId) => (
                            <Link key={docId} href={`/documents/${docId}`}>
                              <Badge 
                                variant="outline" 
                                className="hover-elevate cursor-pointer gap-1"
                                data-testid={`citation-${docId}`}
                              >
                                <FileText className="h-3 w-3" />
                                Doc #{docId}
                                <ExternalLink className="h-2.5 w-2.5" />
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {sendMessageMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-lg px-4 py-3 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        <form onSubmit={handleSendMessage} className="border-t p-4">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your medical history..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || sendMessageMutation.isPending}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
        <Footer />
      </main>
    </div>
  );
}
