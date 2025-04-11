
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  Info,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format, addDays } from 'date-fns';

interface BudgetAndScheduleStepProps {
  campaignData: any;
  updateCampaignData: (data: any) => void;
}

const BudgetAndScheduleStep: React.FC<BudgetAndScheduleStepProps> = ({ 
  campaignData, 
  updateCampaignData 
}) => {
  const [budgetType, setBudgetType] = useState(campaignData.budget?.type || 'daily');
  const [budgetAmount, setBudgetAmount] = useState(campaignData.budget?.amount || 100);
  const [duration, setDuration] = useState(30); // Default 30 days
  const [startDate, setStartDate] = useState<Date>(campaignData.schedule?.startDate || new Date());
  const [endDate, setEndDate] = useState<Date | null>(campaignData.schedule?.endDate || addDays(new Date(), 30));
  
  // Calculate values whenever inputs change
  React.useEffect(() => {
    updateCampaignData({
      budget: {
        amount: budgetAmount,
        type: budgetType,
      },
      schedule: {
        startDate,
        endDate,
      }
    });
  }, [budgetType, budgetAmount, startDate, endDate]);
  
  const handleBudgetTypeChange = (value: string) => {
    setBudgetType(value);
    
    // Convert budget when switching between daily and lifetime
    if (value === 'lifetime' && budgetType === 'daily') {
      setBudgetAmount(budgetAmount * duration);
    } else if (value === 'daily' && budgetType === 'lifetime') {
      setBudgetAmount(Math.round(budgetAmount / duration));
    }
  };
  
  const handleBudgetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setBudgetAmount(value);
    }
  };
  
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      if (endDate && date > endDate) {
        setEndDate(addDays(date, duration));
      }
    }
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setEndDate(date);
      const newDuration = Math.round((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      setDuration(newDuration > 0 ? newDuration : 1);
    }
  };
  
  const formatDate = (date: Date | null) => {
    return date ? format(date, 'PPP') : '';
  };
  
  // Calculate campaign metrics based on budget
  const calculateDailyBudget = () => {
    return budgetType === 'daily' ? budgetAmount : Math.round(budgetAmount / duration);
  };
  
  const calculateTotalBudget = () => {
    return budgetType === 'lifetime' ? budgetAmount : budgetAmount * duration;
  };
  
  // Simplified ticket sales estimate - would be replaced by real modeling in production
  const estimateTicketSales = () => {
    const averageCPC = 1.50; // Average cost per click
    const conversionRate = 0.05; // Conversion rate from click to purchase
    const totalClicks = calculateTotalBudget() / averageCPC;
    return Math.round(totalClicks * conversionRate);
  };
  
  // Simplified ROAS calculation
  const calculateEstimatedROAS = () => {
    const ticketSales = estimateTicketSales();
    const averageTicketPrice = campaignData.event?.ticketPrice || 50;
    const revenue = ticketSales * averageTicketPrice;
    const roas = revenue / calculateTotalBudget();
    return roas.toFixed(1);
  };
  
  const renderBudgetPresets = () => {
    const presets = budgetType === 'daily' 
      ? [10, 25, 50, 100, 150, 200] 
      : [300, 500, 1000, 1500, 2000, 3000];
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {presets.map(preset => (
          <Button
            key={preset}
            type="button"
            variant={budgetAmount === preset ? "default" : "outline"}
            size="sm"
            onClick={() => setBudgetAmount(preset)}
            className={budgetAmount === preset ? "bg-meta-blue hover:bg-meta-dark" : ""}
          >
            ${preset}
          </Button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-8">
      {/* Budget Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-meta-blue" />
          <h2 className="text-lg font-medium">Campaign Budget</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget-type">Budget Type</Label>
              <Select
                value={budgetType}
                onValueChange={handleBudgetTypeChange}
              >
                <SelectTrigger id="budget-type">
                  <SelectValue placeholder="Select budget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Budget</SelectItem>
                  <SelectItem value="lifetime">Lifetime Budget</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {budgetType === 'daily' 
                  ? 'Your ads will spend up to this amount each day' 
                  : 'Your ads will spend up to this amount over the entire campaign period'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget-amount">
                {budgetType === 'daily' ? 'Daily Budget' : 'Lifetime Budget'}
              </Label>
              <div className="flex items-center">
                <span className="bg-slate-100 px-3 py-2 rounded-l-md text-muted-foreground">$</span>
                <Input
                  id="budget-amount"
                  type="number"
                  value={budgetAmount}
                  onChange={handleBudgetAmountChange}
                  className="rounded-l-none border-l-0"
                  min={1}
                />
              </div>
            </div>
            
            {renderBudgetPresets()}
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mt-4">
                {budgetType === 'daily' 
                  ? `Estimated monthly spend: $${(budgetAmount * 30).toLocaleString()}`
                  : `Average daily spend: $${(budgetAmount / duration).toFixed(2)}`}
              </p>
            </div>
          </div>
          
          {/* Campaign Performance Estimates */}
          <Card className="p-4 bg-slate-50 border space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-meta-blue" />
              <h3 className="font-medium">Campaign Estimates</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-lg font-bold">${calculateTotalBudget().toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Daily Budget</p>
                <p className="text-lg font-bold">${calculateDailyBudget()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Est. Ticket Sales</p>
                <p className="text-lg font-bold">{estimateTicketSales()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Est. ROAS</p>
                <p className="text-lg font-bold">{calculateEstimatedROAS()}x</p>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Actual results may vary based on targeting, creatives, and market conditions
            </p>
          </Card>
        </div>
      </div>
      
      {/* Schedule Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-meta-blue" />
          <h2 className="text-lg font-medium">Campaign Schedule</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(startDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(endDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={handleEndDateChange}
                      disabled={(date) => date < startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Campaign Duration</Label>
                <span className="text-sm text-muted-foreground">{duration} days</span>
              </div>
              <Slider
                value={[duration]}
                min={1}
                max={90}
                step={1}
                onValueChange={(values) => {
                  const newDuration = values[0];
                  setDuration(newDuration);
                  setEndDate(addDays(startDate, newDuration));
                  if (budgetType === 'lifetime') {
                    // Adjust lifetime budget based on new duration
                    const dailyRate = budgetAmount / duration;
                    setBudgetAmount(Math.round(dailyRate * newDuration));
                  }
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 day</span>
                <span>30 days</span>
                <span>90 days</span>
              </div>
            </div>
            
            {campaignData.event && startDate && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  Your event date is {formatDate(new Date(campaignData.event.date))}, which is{' '}
                  {Math.max(0, Math.round((new Date(campaignData.event.date).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))}{' '}
                  days after your campaign starts.
                </p>
              </div>
            )}
          </div>
          
          {/* Recommended Timeline */}
          <Card className="p-4 bg-slate-50 border">
            <h3 className="font-medium flex items-center mb-3">
              <TrendingUp className="h-4 w-4 mr-2 text-meta-blue" />
              Recommended Ad Spending Strategy
            </h3>
            <div className="space-y-4">
              <div className="relative pt-2">
                <div className="h-2 bg-slate-200 rounded-full">
                  <div 
                    className="absolute top-0 left-0 h-2 bg-meta-blue rounded-full" 
                    style={{ width: '33%' }}
                  ></div>
                  <div 
                    className="absolute top-0 left-[33%] h-2 bg-indigo-500 rounded-full" 
                    style={{ width: '45%' }}
                  ></div>
                  <div 
                    className="absolute top-0 left-[78%] h-2 bg-purple-500 rounded-full" 
                    style={{ width: '22%' }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Start</span>
                  <span>Event</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-meta-blue mr-2"></div>
                  <span className="text-sm font-medium">Early Awareness (33%)</span>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  ${Math.round(calculateTotalBudget() * 0.33).toLocaleString()} - Build awareness with broader targeting
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                  <span className="text-sm font-medium">Peak Promotion (45%)</span>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  ${Math.round(calculateTotalBudget() * 0.45).toLocaleString()} - Focus on conversions with narrower targeting
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm font-medium">Last Minute (22%)</span>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  ${Math.round(calculateTotalBudget() * 0.22).toLocaleString()} - Create urgency with remarketing
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BudgetAndScheduleStep;
