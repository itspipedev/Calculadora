import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Calculation, CalculationResponse } from "@shared/schema";

export default function Calculator() {
  const [operandA, setOperandA] = useState<string>("");
  const [operandB, setOperandB] = useState<string>("");
  const [operation, setOperation] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);
  const { toast } = useToast();

  const calculationMutation = useMutation({
    mutationFn: async (data: Calculation): Promise<CalculationResponse> => {
      const response = await apiRequest("POST", "/api/calculate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.result);
    },
    onError: (error: Error) => {
      toast({
        title: "Calculation Error",
        description: error.message,
        variant: "destructive",
      });
      setResult(null);
    },
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!operandA || !operandB || !operation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before calculating.",
        variant: "destructive",
      });
      return;
    }

    const a = parseFloat(operandA);
    const b = parseFloat(operandB);

    if (isNaN(a) || isNaN(b)) {
      toast({
        title: "Invalid Numbers",
        description: "Please enter valid numbers.",
        variant: "destructive",
      });
      return;
    }

    calculationMutation.mutate({
      operation: operation as "sum" | "subtract" | "multiply" | "divide",
      a,
      b,
    });
  };

  const getOperationSymbol = (op: string) => {
    switch (op) {
      case "sum": return "+";
      case "subtract": return "-";
      case "multiply": return "×";
      case "divide": return "÷";
      default: return "";
    }
  };

  const getOperationName = (op: string) => {
    switch (op) {
      case "sum": return "Addition";
      case "subtract": return "Subtraction";
      case "multiply": return "Multiplication";
      case "divide": return "Division";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      {/* Header */}
      <header className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Calculator App</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A modern calculator application built with React frontend and Node.js backend. 
          Perform basic arithmetic operations with a clean, intuitive interface.
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Calculator Card */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-card-foreground mb-2">Calculator</h2>
                <p className="text-muted-foreground">Enter two numbers and select an operation</p>
              </div>

              {/* Calculator Form */}
              <form onSubmit={handleCalculate} className="space-y-6">
                {/* Input A */}
                <div className="space-y-2">
                  <Label htmlFor="operand-a">First Number (a)</Label>
                  <Input
                    id="operand-a"
                    type="number"
                    placeholder="Enter first number"
                    value={operandA}
                    onChange={(e) => setOperandA(e.target.value)}
                    data-testid="input-operand-a"
                  />
                </div>

                {/* Operation Select */}
                <div className="space-y-2">
                  <Label htmlFor="operation">Operation</Label>
                  <Select value={operation} onValueChange={setOperation}>
                    <SelectTrigger data-testid="select-operation">
                      <SelectValue placeholder="Select operation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sum">Addition (+)</SelectItem>
                      <SelectItem value="subtract">Subtraction (-)</SelectItem>
                      <SelectItem value="multiply">Multiplication (×)</SelectItem>
                      <SelectItem value="divide">Division (÷)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Input B */}
                <div className="space-y-2">
                  <Label htmlFor="operand-b">Second Number (b)</Label>
                  <Input
                    id="operand-b"
                    type="number"
                    placeholder="Enter second number"
                    value={operandB}
                    onChange={(e) => setOperandB(e.target.value)}
                    data-testid="input-operand-b"
                  />
                </div>

                {/* Calculate Button */}
                <Button 
                  type="submit"
                  className="w-full"
                  disabled={calculationMutation.isPending}
                  data-testid="button-calculate"
                >
                  {calculationMutation.isPending ? "Calculating..." : "Calculate"}
                </Button>
              </form>

              {/* Result Display */}
              <div className="mt-8 p-6 bg-muted rounded-lg border">
                <h3 className="text-lg font-medium text-card-foreground mb-3">Result</h3>
                
                {calculationMutation.isPending && (
                  <div className="space-y-2">
                    <div className="animate-pulse">
                      <div className="h-8 bg-secondary rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-secondary rounded w-2/3"></div>
                    </div>
                  </div>
                )}

                {!calculationMutation.isPending && result !== null && operandA && operandB && operation && (
                  <div className="space-y-2" data-testid="result-display">
                    <div className="text-3xl font-bold text-primary">{result}</div>
                    <div className="text-sm text-muted-foreground">
                      {operandA} {getOperationSymbol(operation)} {operandB} = {result}
                    </div>
                  </div>
                )}

                {!calculationMutation.isPending && result === null && (
                  <div className="text-muted-foreground" data-testid="result-empty">
                    Enter numbers and select an operation to see the result
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* API Documentation */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">API Documentation</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-card-foreground mb-2">Endpoint</h4>
                    <code className="bg-muted px-3 py-1 rounded text-sm">POST /api/calculate</code>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-card-foreground mb-2">Request Body</h4>
                    <pre className="bg-muted p-3 rounded text-sm overflow-x-auto"><code>{`{
  "operation": "sum",
  "a": 5,
  "b": 3
}`}</code></pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-card-foreground mb-2">Response</h4>
                    <pre className="bg-muted p-3 rounded text-sm overflow-x-auto"><code>{`{
  "result": 8
}`}</code></pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supported Operations */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Supported Operations</h3>
                <div className="space-y-3">
                  {[
                    { name: "Addition", code: "sum" },
                    { name: "Subtraction", code: "subtract" },
                    { name: "Multiplication", code: "multiply" },
                    { name: "Division", code: "divide" },
                  ].map((op, index, array) => (
                    <div 
                      key={op.code}
                      className={`flex items-center justify-between py-2 ${
                        index < array.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <span className="font-medium">{op.name}</span>
                      <code className="bg-muted px-2 py-1 rounded text-sm">{op.code}</code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Features</h3>
                <ul className="space-y-2 text-muted-foreground">
                  {[
                    "REST API with Express.js backend",
                    "React frontend with hooks",
                    "Input validation and error handling",
                    "Responsive design",
                    "Modern UI with Tailwind CSS",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Specs */}
        <Card className="mt-12 shadow-lg">
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold text-card-foreground mb-6">Technical Implementation</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Backend Implementation */}
              <div>
                <h4 className="text-lg font-medium text-card-foreground mb-4">Backend (Node.js + Express)</h4>
                <div className="space-y-3 text-sm">
                  {[
                    { title: "Server Setup", desc: "Express server running on port 5000" },
                    { title: "API Endpoint", desc: "POST /calculate with JSON body validation" },
                    { title: "Error Handling", desc: "Division by zero and input validation" },
                    { title: "CORS", desc: "Cross-origin requests enabled for frontend" },
                  ].map((item) => (
                    <div key={item.title} className="bg-muted p-3 rounded">
                      <div className="font-medium mb-1">{item.title}</div>
                      <div className="text-muted-foreground">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frontend Implementation */}
              <div>
                <h4 className="text-lg font-medium text-card-foreground mb-4">Frontend (React)</h4>
                <div className="space-y-3 text-sm">
                  {[
                    { title: "Components", desc: "Functional components with hooks" },
                    { title: "State Management", desc: "useState for form data and results" },
                    { title: "API Communication", desc: "Fetch API for backend requests" },
                    { title: "UI Framework", desc: "Tailwind CSS for styling" },
                  ].map((item) => (
                    <div key={item.title} className="bg-muted p-3 rounded">
                      <div className="font-medium mb-1">{item.title}</div>
                      <div className="text-muted-foreground">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto mt-12 text-center">
        <div className="border-t border-border pt-8">
          <p className="text-muted-foreground">
            Calculator App - Built with React + Node.js + Express
          </p>
        </div>
      </footer>
    </div>
  );
}
