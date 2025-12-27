import { useState } from 'react';
import { MashStep, YieldEntry } from '../types/brewing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, X, Thermometer, Clock, Calendar, Beer, Check } from 'lucide-react';
import { calculateABV, calculateCalories, calculateCarbs } from '../utils/brewing-calculations';

interface ProcessTrackerProps {
  mashSteps: MashStep[];
  yeastPitchDate?: Date;
  bottlingDate?: Date;
  finalYield?: YieldEntry[];
  processNotes?: string;
  actualOG?: number;
  actualFG?: number;
  onAddMashStep: (step: Omit<MashStep, 'id'>) => void;
  onUpdateMashStep: (id: string, step: Omit<MashStep, 'id'>) => void;
  onRemoveMashStep: (id: string) => void;
  onUpdateYeastPitchDate: (date: Date | undefined) => void;
  onUpdateBottlingDate: (date: Date | undefined) => void;
  onUpdateFinalYield: (yields: YieldEntry[]) => void;
  onUpdateProcessNotes: (notes: string) => void;
  onUpdateActualOG: (og: number | undefined) => void;
  onUpdateActualFG: (fg: number | undefined) => void;
}

export function ProcessTracker({
  mashSteps,
  yeastPitchDate,
  bottlingDate,
  finalYield,
  processNotes,
  actualOG,
  actualFG,
  onAddMashStep,
  onUpdateMashStep,
  onRemoveMashStep,
  onUpdateYeastPitchDate,
  onUpdateBottlingDate,
  onUpdateFinalYield,
  onUpdateProcessNotes,
  onUpdateActualOG,
  onUpdateActualFG,
}: ProcessTrackerProps) {
  const [showMashOptions, setShowMashOptions] = useState(false);
  const [editingMashId, setEditingMashId] = useState<string | null>(null);
  const [mashStepName, setMashStepName] = useState('');
  const [mashTemp, setMashTemp] = useState('');
  const [mashDuration, setMashDuration] = useState('');

  // Common mash step templates
  const commonMashSteps = [
    { 
      name: 'Single Infusion', 
      temperature: 152, 
      duration: 60,
      description: 'Balanced conversion of starches to fermentable and non-fermentable sugars. Creates medium body.'
    },
    { 
      name: 'Mash Out', 
      temperature: 168, 
      duration: 10,
      description: 'Stops enzyme activity and makes the mash easier to lauter. Improves efficiency.'
    },
    { 
      name: 'Protein Rest', 
      temperature: 122, 
      duration: 20,
      description: 'Breaks down proteins for better head retention and clarity. Useful for undermodified malts.'
    },
    { 
      name: 'Beta Amylase Rest', 
      temperature: 145, 
      duration: 30,
      description: 'Favors beta amylase enzyme. Creates more fermentable sugars for a drier, lighter-bodied beer.'
    },
    { 
      name: 'Alpha Amylase Rest', 
      temperature: 158, 
      duration: 30,
      description: 'Favors alpha amylase enzyme. Creates more unfermentable sugars for fuller body and sweetness.'
    },
  ];

  const handleAddMashStep = () => {
    if (!mashStepName || !mashTemp || !mashDuration) return;

    const stepData = {
      name: mashStepName,
      temperature: parseInt(mashTemp),
      duration: parseInt(mashDuration),
    };

    if (editingMashId && editingMashId !== 'custom-new') {
      onUpdateMashStep(editingMashId, stepData);
      setEditingMashId(null);
    } else {
      onAddMashStep(stepData);
    }

    setMashStepName('');
    setMashTemp('');
    setMashDuration('');
    setEditingMashId(null);
  };

  const handleAddCommonStep = (step: Omit<MashStep, 'id'>) => {
    onAddMashStep(step);
    setShowMashOptions(false);
  };

  const startEditingMashStep = (step: MashStep) => {
    setMashStepName(step.name);
    setMashTemp(step.temperature.toString());
    setMashDuration(step.duration.toString());
    setEditingMashId(step.id);
  };

  const cancelEditingMashStep = () => {
    setMashStepName('');
    setMashTemp('');
    setMashDuration('');
    setEditingMashId(null);
  };

  const handleCancelMashOptions = () => {
    setMashStepName('');
    setMashTemp('');
    setMashDuration('');
    setEditingMashId(null);
    setShowMashOptions(false);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const handleDateChange = (value: string, setter: (date: Date | undefined) => void) => {
    if (!value) {
      setter(undefined);
    } else {
      setter(new Date(value));
    }
  };

  const yieldTypeLabels: Record<YieldEntry['type'], string> = {
    'gallons': 'Gallons',
    'bottles-22oz': '22 oz Bottles',
    'bottles-12oz': '12 oz Bottles',
    'cornelius-keg': 'Cornelius Kegs',
  };

  const handleAddYield = (type: YieldEntry['type']) => {
    const newYield: YieldEntry = {
      id: crypto.randomUUID(),
      type,
      amount: 0,
    };
    const currentYields = finalYield || [];
    onUpdateFinalYield([...currentYields, newYield]);
  };

  const handleUpdateYield = (id: string, amount: number) => {
    if (!finalYield) return;
    const updatedYields = finalYield.map(y => 
      y.id === id ? { ...y, amount } : y
    );
    onUpdateFinalYield(updatedYields);
  };

  const handleRemoveYield = (id: string) => {
    if (!finalYield) return;
    const updatedYields = finalYield.filter(y => y.id !== id);
    onUpdateFinalYield(updatedYields);
  };

  const renderMashStepForm = () => {
    return (
      <div className="p-4 border-2 rounded-lg bg-orange-50/50 border-orange-200 space-y-4">
        <div className="space-y-2">
          <Label>Step Name</Label>
          <Input
            value={mashStepName}
            onChange={(e) => setMashStepName(e.target.value)}
            placeholder="e.g., Saccharification Rest"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Temperature (°F)</Label>
            <Input
              type="number"
              value={mashTemp}
              onChange={(e) => setMashTemp(e.target.value)}
              placeholder="152"
            />
          </div>
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={mashDuration}
              onChange={(e) => setMashDuration(e.target.value)}
              placeholder="60"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleAddMashStep}
            disabled={!mashStepName || !mashTemp || !mashDuration}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            {editingMashId ? 'Update' : 'Add'}
          </Button>
          <Button variant="outline" onClick={editingMashId ? cancelEditingMashStep : handleCancelMashOptions}>
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brewing Process</CardTitle>
        <CardDescription>Define mash steps and track important brewing milestones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mash Steps Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3>Mash Steps</h3>
            {!showMashOptions && !editingMashId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMashOptions(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Mash Step
              </Button>
            )}
          </div>

          {/* Common mash steps and custom option - shown when button clicked */}
          {showMashOptions && !editingMashId && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Select a step type</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelMashOptions}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid gap-3">
                {commonMashSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-lg hover:border-orange-300 transition-colors cursor-pointer bg-card"
                    onClick={() => handleAddCommonStep(step)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{step.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {step.temperature}°F • {step.duration} min
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddCommonStep(step);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Custom Step Option */}
                <div
                  className="p-3 border rounded-lg hover:border-orange-300 transition-colors cursor-pointer bg-card border-dashed"
                  onClick={() => {
                    setShowMashOptions(false);
                    setMashStepName('');
                    setMashTemp('');
                    setMashDuration('');
                    setEditingMashId('custom-new');
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium">Custom Step</div>
                      <p className="text-sm text-muted-foreground">Define your own temperature and duration</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMashOptions(false);
                        setMashStepName('');
                        setMashTemp('');
                        setMashDuration('');
                        setEditingMashId('custom-new');
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mash step form - shown ONLY when adding custom new step, not when editing existing */}
          {editingMashId === 'custom-new' && renderMashStepForm()}

          {/* Display mash steps */}
          {mashSteps.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Mash Schedule</div>
              {mashSteps.map((step) => {
                const isEditing = editingMashId === step.id;
                
                return (
                  <div key={step.id} className="space-y-2">
                    {isEditing ? (
                      renderMashStepForm()
                    ) : (
                      <div
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => startEditingMashStep(step)}
                      >
                        <div className="flex-1">
                          <div>{step.name}</div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Thermometer className="w-3 h-3" />
                              {step.temperature}°F
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {step.duration} min
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveMashStep(step.id);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Brewing Milestones Section */}
        <div className="space-y-4 pt-4 border-t">
          <h3>Brewing Milestones</h3>

          <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
            {/* Dates Section */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Yeast Pitch Date
                </Label>
                <Input
                  type="date"
                  value={formatDate(yeastPitchDate)}
                  onChange={(e) => handleDateChange(e.target.value, onUpdateYeastPitchDate)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Bottling Date
                </Label>
                <Input
                  type="date"
                  value={formatDate(bottlingDate)}
                  onChange={(e) => handleDateChange(e.target.value, onUpdateBottlingDate)}
                />
              </div>
            </div>

            {/* Gravity Readings */}
            <div className="pt-4 border-t">
              <Label className="mb-3 block">Gravity Readings</Label>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Actual OG</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={actualOG && !isNaN(actualOG) ? actualOG : ''}
                    onChange={(e) => onUpdateActualOG(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="1.050"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Actual FG</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={actualFG && !isNaN(actualFG) ? actualFG : ''}
                    onChange={(e) => onUpdateActualFG(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="1.010"
                  />
                </div>
              </div>

              {actualOG && actualFG && (
                <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Actual ABV</div>
                    <div className="font-medium">{calculateABV(actualOG, actualFG).toFixed(2)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Calories (12 oz)</div>
                    <div className="font-medium">{Math.round(calculateCalories(actualOG, actualFG, calculateABV(actualOG, actualFG)))}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Carbs (12 oz)</div>
                    <div className="font-medium">{calculateCarbs(actualOG, actualFG).toFixed(1)}g</div>
                  </div>
                </div>
              )}
            </div>

            {/* Final Yield */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Beer className="w-4 h-4" />
                  Final Yield
                </Label>
                <div className="flex gap-1">
                  {!finalYield?.find(y => y.type === 'gallons') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddYield('gallons')}
                    >
                      + Gallons
                    </Button>
                  )}
                  {!finalYield?.find(y => y.type === 'bottles-12oz') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddYield('bottles-12oz')}
                    >
                      + 12oz
                    </Button>
                  )}
                  {!finalYield?.find(y => y.type === 'bottles-22oz') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddYield('bottles-22oz')}
                    >
                      + 22oz
                    </Button>
                  )}
                  {!finalYield?.find(y => y.type === 'cornelius-keg') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddYield('cornelius-keg')}
                    >
                      + Keg
                    </Button>
                  )}
                </div>
              </div>

              {finalYield && finalYield.length > 0 && (
                <div className="space-y-2">
                  {finalYield.map(y => (
                    <div key={y.id} className="flex items-center gap-2">
                      <Label className="w-32 text-sm text-muted-foreground">{yieldTypeLabels[y.type]}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={y.amount && !isNaN(y.amount) ? y.amount : ''}
                        onChange={(e) => handleUpdateYield(y.id, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveYield(y.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Process Notes Section */}
        <div className="space-y-4 pt-4 border-t">
          <h3>Process Notes</h3>
          <Textarea
            value={processNotes || ''}
            onChange={(e) => onUpdateProcessNotes(e.target.value)}
            placeholder="Record any observations, adjustments, or notes about your brewing process..."
            rows={5}
          />
        </div>
      </CardContent>
    </Card>
  );
}