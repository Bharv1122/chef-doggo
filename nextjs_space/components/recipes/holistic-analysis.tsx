'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flame, Snowflake, Minus, Info } from 'lucide-react';

interface HolisticAnalysisProps {
  holisticRecommendations?: any;
  holisticConflicts?: any;
  thermalNatureAnalysis?: any;
}

export function HolisticAnalysis({ 
  holisticRecommendations, 
  holisticConflicts,
  thermalNatureAnalysis 
}: HolisticAnalysisProps) {
  if (!holisticRecommendations && !thermalNatureAnalysis) {
    return null;
  }

  const getThermalIcon = (nature: string) => {
    switch (nature) {
      case 'warming':
      case 'hot':
        return <Flame className="w-3 h-3" />;
      case 'cooling':
      case 'cold':
        return <Snowflake className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getThermalColor = (nature: string) => {
    switch (nature) {
      case 'hot':
        return 'bg-red-500 text-white';
      case 'warming':
        return 'bg-orange-500 text-white';
      case 'cooling':
        return 'bg-blue-500 text-white';
      case 'cold':
        return 'bg-indigo-500 text-white';
      default:
        return 'bg-gray-300 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Holistic Conflict Alert */}
      {holisticConflicts?.hasConflict && (
        <Alert className="bg-amber-50 border-amber-300">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800">
            <strong>Holistic Guidance Note:</strong> Your dog's TCVM constitution and Ayurvedic dosha suggest different approaches.
            We've prioritized based on health conditions. {holisticConflicts.resolution}
          </AlertDescription>
        </Alert>
      )}

      {/* Thermal Nature Analysis */}
      {thermalNatureAnalysis && thermalNatureAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#F97316]" />
              Thermal Nature of Ingredients
            </CardTitle>
            <CardDescription>
              Food energetics from Traditional Chinese Veterinary Medicine (TCVM)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {thermalNatureAnalysis.map((item: any, index: number) => (
                <Badge 
                  key={index} 
                  className={`${getThermalColor(item.thermalNature)} flex items-center gap-1 px-3 py-1`}
                >
                  {getThermalIcon(item.thermalNature)}
                  <span className="capitalize">{item.ingredient}</span>
                  <span className="text-xs opacity-80">({item.thermalNature})</span>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3">
              <strong>Note:</strong> Warming foods support cold/yin dogs, cooling foods support hot/yang dogs, neutral foods work for all.
            </p>
          </CardContent>
        </Card>
      )}

      {/* TCVM Analysis */}
      {holisticRecommendations?.tcvm && (
        <Card className="bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg text-[#1C1917]">TCVM Constitution Analysis</CardTitle>
            <CardDescription>
              Traditional Chinese Veterinary Medicine recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-[#1C1917] mb-1">Constitution Type</p>
              <Badge className="bg-amber-600 text-white capitalize">
                {holisticRecommendations.tcvm.constitution}
              </Badge>
            </div>

            {holisticRecommendations.tcvm.recommendations && (
              <div className="space-y-2">
                {holisticRecommendations.tcvm.recommendations.favor?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-1">✓ Recommended for this constitution:</p>
                    <p className="text-xs text-gray-700">
                      {holisticRecommendations.tcvm.recommendations.favor.join(', ')}
                    </p>
                  </div>
                )}
                {holisticRecommendations.tcvm.recommendations.avoid?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-1">× Avoid:</p>
                    <p className="text-xs text-gray-700">
                      {holisticRecommendations.tcvm.recommendations.avoid.join(', ')}
                    </p>
                  </div>
                )}
                {holisticRecommendations.tcvm.recommendations.reasoning && (
                  <p className="text-xs text-gray-600 italic mt-2">
                    {holisticRecommendations.tcvm.recommendations.reasoning}
                  </p>
                )}
              </div>
            )}

            {holisticRecommendations.tcvm.aligned?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">
                  ✓ Aligned ingredients in this recipe:
                </p>
                <div className="flex flex-wrap gap-1">
                  {holisticRecommendations.tcvm.aligned.map((ing: string, i: number) => (
                    <Badge key={i} className="bg-green-100 text-green-800 text-xs">
                      {ing}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {holisticRecommendations.tcvm.misaligned?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-amber-700 mb-1">
                  ⚠️ Consider moderating:
                </p>
                <div className="space-y-1">
                  {holisticRecommendations.tcvm.misaligned.map((item: any, i: number) => (
                    <div key={i} className="text-xs">
                      <Badge className="bg-amber-100 text-amber-800 text-xs mr-2">
                        {item.ingredient}
                      </Badge>
                      <span className="text-gray-600">{item.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ayurveda Analysis */}
      {holisticRecommendations?.ayurveda && (
        <Card className="bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-[#1C1917]">Ayurvedic Dosha Analysis</CardTitle>
            <CardDescription>
              Ayurvedic dietary principles for balance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-[#1C1917] mb-1">Dosha Type</p>
              <Badge className="bg-green-600 text-white capitalize">
                {holisticRecommendations.ayurveda.dosha}
              </Badge>
            </div>

            {holisticRecommendations.ayurveda.aligned?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">
                  ✓ Balancing ingredients:
                </p>
                <div className="flex flex-wrap gap-1">
                  {holisticRecommendations.ayurveda.aligned.map((ing: string, i: number) => (
                    <Badge key={i} className="bg-green-100 text-green-800 text-xs">
                      {ing}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {holisticRecommendations.ayurveda.misaligned?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-amber-700 mb-1">
                  ⚠️ May aggravate dosha:
                </p>
                <div className="space-y-1">
                  {holisticRecommendations.ayurveda.misaligned.map((item: any, i: number) => (
                    <div key={i} className="text-xs">
                      <Badge className="bg-amber-100 text-amber-800 text-xs mr-2">
                        {item.ingredient}
                      </Badge>
                      <span className="text-gray-600">{item.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Condition-Specific Diet */}
      {holisticRecommendations?.conditionDiet && (
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-[#1C1917]">Therapeutic Diet</CardTitle>
            <CardDescription className="capitalize">
              {holisticRecommendations.conditionDiet.type.replace('-', ' ')} diet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              {holisticRecommendations.conditionDiet.notes}
            </p>
            {(holisticRecommendations.conditionDiet.type === 'ketogenic' || 
              holisticRecommendations.conditionDiet.type === 'renal' ||
              holisticRecommendations.conditionDiet.type === 'cardiac') && (
              <Alert className="mt-3 bg-amber-50 border-amber-300">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-800">
                  <strong>Important:</strong> Therapeutic diets require regular veterinary monitoring and supervision.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
