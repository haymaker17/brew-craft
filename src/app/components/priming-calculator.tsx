import { useState } from 'react';
import { X, Droplets } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface PrimingCalculatorProps {
  onClose: () => void;
}

type SugarType = 'dextrose' | 'table' | 'dme' | 'honey' | 'brown' | 'belgian' | 'molasses' | 'maple' | 'turbinado' | 'agave';

const sugarTypes = {
  dextrose: { name: 'Corn Sugar (Dextrose)', factor: 1.0 },
  table: { name: 'Table Sugar (Sucrose)', factor: 0.91 },
  brown: { name: 'Brown Sugar', factor: 0.91 },
  turbinado: { name: 'Turbinado/Raw Sugar', factor: 0.91 },
  belgian: { name: 'Belgian Candi Sugar', factor: 0.91 },
  dme: { name: 'Dry Malt Extract', factor: 1.33 },
  honey: { name: 'Honey', factor: 1.25 },
  maple: { name: 'Maple Syrup', factor: 1.25 },
  molasses: { name: 'Molasses', factor: 1.11 },
  agave: { name: 'Agave Nectar', factor: 1.18 },
};

// Calculate residual CO2 based on temperature (Henry's Law)
const getResidualCO2 = (tempF: number): number => {
  const tempC = (tempF - 32) * 5 / 9;
  return 3.0378 - (0.050062 * tempC) + (0.00026555 * tempC * tempC);
};

export function PrimingCalculator({ onClose }: PrimingCalculatorProps) {
  const [batchSize, setBatchSize] = useState<string>('5');
  const [desiredCO2, setDesiredCO2] = useState<string>('2.4');
  const [temperature, setTemperature] = useState<string>('68');
  const [sugarType, setSugarType] = useState<SugarType>('dextrose');

  const calculateSugar = () => {
    const batch = parseFloat(batchSize) || 0;
    const targetCO2 = parseFloat(desiredCO2) || 0;
    const temp = parseFloat(temperature) || 68;
    const residualCO2 = getResidualCO2(temp);
    const co2Needed = targetCO2 - residualCO2;
    
    if (co2Needed <= 0 || batch <= 0) return { oz: 0, grams: 0 };
    
    // Base calculation: oz of dextrose = (CO2 volumes needed) * (gallons) * 0.5
    const dextroseOz = co2Needed * batch * 0.5;
    const adjustedOz = dextroseOz * sugarTypes[sugarType].factor;
    const grams = adjustedOz * 28.35;
    
    return {
      oz: adjustedOz,
      grams: grams,
      co2Needed: co2Needed,
      residualCO2: residualCO2,
    };
  };

  const result = calculateSugar();

  const carbonationLevels = [
    { style: 'British Ales', volumes: '1.5-2.0' },
    { style: 'American Ales', volumes: '2.2-2.6' },
    { style: 'European Lagers', volumes: '2.4-2.6' },
    { style: 'Belgian Ales', volumes: '2.0-4.5' },
    { style: 'Wheat Beers', volumes: '3.0-4.5' },
    { style: 'Lambics', volumes: '2.4-4.5' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2>Priming Sugar Calculator</h2>
              <p className="text-sm text-muted-foreground">
                Calculate carbonation for bottling
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Input Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batchSize">Batch Size (gallons)</Label>
              <Input
                id="batchSize"
                type="number"
                step="0.1"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                placeholder="5.0"
              />
            </div>
            
            <div>
              <Label htmlFor="desiredCO2">Desired CO₂ Volumes</Label>
              <Input
                id="desiredCO2"
                type="number"
                step="0.1"
                value={desiredCO2}
                onChange={(e) => setDesiredCO2(e.target.value)}
                placeholder="2.4"
              />
            </div>

            <div>
              <Label htmlFor="temperature">Beer Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                step="1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="68"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Temperature at bottling time
              </p>
            </div>

            <div>
              <Label htmlFor="sugarType">Sugar Type</Label>
              <select
                id="sugarType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={sugarType}
                onChange={(e) => setSugarType(e.target.value as SugarType)}
              >
                {Object.entries(sugarTypes).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          {result.oz > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="mb-4">Required Priming Sugar</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-background rounded-lg border">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {result.oz.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">ounces</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg border">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {result.grams.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">grams</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-sm text-muted-foreground space-y-1">
                <p>Residual CO₂ in beer: {result.residualCO2.toFixed(2)} volumes</p>
                <p>CO₂ needed from priming: {result.co2Needed.toFixed(2)} volumes</p>
              </div>
            </div>
          )}

          {/* Reference Guide */}
          <div>
            <h3 className="mb-3">Carbonation Level Reference</h3>
            <div className="space-y-2">
              {carbonationLevels.map((level, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <span className="text-sm">{level.style}</span>
                  <span className="text-sm font-medium">{level.volumes} vol</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Measure your beer temperature at bottling time</li>
              <li>Enter your batch size and desired carbonation level</li>
              <li>Select your priming sugar type</li>
              <li>Dissolve the calculated amount of sugar in 1-2 cups of boiling water</li>
              <li>Cool the solution and add to your bottling bucket</li>
              <li>Gently mix with your beer and bottle</li>
              <li>Store bottles at room temperature for 2-3 weeks to carbonate</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/30">
          <Button onClick={onClose} className="w-full">
            Close Calculator
          </Button>
        </div>
      </div>
    </div>
  );
}