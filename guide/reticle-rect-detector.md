import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChakraProvider, extendTheme, Box, Flex, VStack, HStack, Heading, Text, Switch, Button, Badge, IconButton, useToast, Divider, Kbd, Spacer, Input, NumberInput, NumberInputField, Checkbox, Stack, Center
} from '@chakra-ui/react';
import { DeleteIcon, DownloadIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { Stage, Layer, Image as KonvaImage, Rect as KonvaRect, Line as KonvaLine, Circle as KonvaCircle } from 'react-konva';
import cv from '@techstark/opencv-js';
import { v4 as uuidv4 } from 'uuid';
import { RectData, Point, ScribelaneStructure, LaneElement, PlacementOptions, PlacedElement } from './types';

// Chakra UI 다크 테마 설정
const theme = extendTheme({
  config: { initialColorMode: 'dark', useSystemColorMode: false },
  styles: { global: { body: { bg: 'gray.900', color: 'white' } } },
});

// OpenCV 검출기 클래스 (기존 로직 동일)
class OpencvDetector {
  static async detect(imgElement: HTMLImageElement): Promise<RectData[]> {
    const src = cv.imread(imgElement);
    const hsv = new cv.Mat();
    cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

    const mask = new cv.Mat();
    const low1 = cv.matFromArray(3, 1, cv.CV_64F, [0, 70, 50]);
    const high1 = cv.matFromArray(3, 1, cv.CV_64F, [10, 255, 255]);
    const low2 = cv.matFromArray(3, 1, cv.CV_64F, [170, 70, 50]);
    const high2 = cv.matFromArray(3, 1, cv.CV_64F, [180, 255, 255]);
    
    const m1 = new cv.Mat(), m2 = new cv.Mat();
    cv.inRange(hsv, low1, high1, m1);
    cv.inRange(hsv, low2, high2, m2);
    cv.bitwise_or(m1, m2, mask);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(mask, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

    const detectedRects: RectData[] = [];

    for (let i = 0; i < contours.size(); ++i) {
      const cnt = contours.get(i);
      const area = cv.contourArea(cnt);
      if (area < 100) continue;

      const approx = new cv.Mat();
      cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

      if (approx.rows === 4) {
        const bound = cv.boundingRect(approx);
        // Extent 필터링 (순수 직사각형 확인)
        if (area / (bound.width * bound.height) > 0.9) {
          detectedRects.push({
            id: uuidv4(),
            x: bound.x,
            y: bound.y,
            width: bound.width,
            height: bound.height,
            isActive: true,
            isManual: false
          });
        }
      }
      approx.delete();
    }

    [src, hsv, m1, m2, mask, contours, hierarchy, low1, high1, low2, high2].forEach(m => m.delete());
    return detectedRects;
  }
}

const App: React.FC = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scribelane, setScribelane] = useState<ScribelaneStructure | null>(null);
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newRectStart, setNewRectStart] = useState<Point | null>(null);
  const [tempRect, setTempRect] = useState<RectData | null>(null);
  const [placementN, setPlacementN] = useState<number>(10);
  const [placementOptions, setPlacementOptions] = useState<PlacementOptions>({
    placeAtCenter: true,
    placeAtCorners: true,
    placeUniformly: true,
  });
  const toast = useToast();

  // 1 & 2. 클립보드 붙여넣기 및 자동 검출 (Boundary & Chips 구분)
  const handlePaste = useCallback(async (e: any) => {
    const item = e.clipboardData?.items[0];
    if (item?.type.includes('image')) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          setImage(img);
          const detectedRects = await OpencvDetector.detect(img);
          
          if (detectedRects.length === 0) {
            toast({ title: "사각형을 검출하지 못했습니다.", status: "warning", duration: 3000 });
            return;
          }

          // 면적 기준 정렬하여 가장 큰 것을 Boundary로 설정
          detectedRects.sort((a, b) => (b.width * b.height) - (a.width * a.height));
          const boundaryRect = detectedRects[0];
          const chipsRects = detectedRects.slice(1);

          setScribelane(new ScribelaneStructure(boundaryRect, chipsRects));
          toast({ title: "이미지 및 사각형 로드 완료", status: "success", duration: 2000 });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(blob!);
    }
  }, [toast]);

  // 3 & 4. 수동 드로잉 이벤트 (Chips 추가)
  const handleMouseDown = (e: any) => {
    if (!image || !scribelane) return;
    const pos = e.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setNewRectStart(pos);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !newRectStart) return;
    const pos = e.target.getStage().getPointerPosition();
    const newTempRect: RectData = {
      id: uuidv4(),
      x: Math.min(newRectStart.x, pos.x),
      y: Math.min(newRectStart.y, pos.y),
      width: Math.abs(newRectStart.x - pos.x),
      height: Math.abs(newRectStart.y - pos.y),
      isActive: true,
      isManual: true, // 수동 생성
    };
    setTempRect(newTempRect);
  };

  const handleMouseUp = () => {
    if (tempRect && tempRect.width > 5) {
      setScribelane(prev => prev ? new ScribelaneStructure(prev.boundary, [...prev.chips, tempRect]) : null);
    }
    setIsDrawing(false);
    setNewRectStart(null);
    setTempRect(null);
  };

  // 5. Scribelane 분석 알고리즘 (꾸불꾸불한 영역을 직선 LaneElement로 보정)
  const analyzeScribelane = () => {
    if (!scribelane) return;
    const { boundary, chips } = scribelane;
    const newLaneElements: LaneElement[] = [];

    // 간소화된 직선화 로직: Chips 사이의 수평/수직 간격을 선분으로 정의
    chips.forEach((c1, i) => {
      // 1. Boundary와 Chips 사이의 간격 (가장 외곽)
      newLaneElements.push(new LaneElement({x: boundary.x, y: c1.y + c1.height/2}, {x: c1.x, y: c1.y + c1.height/2}));

      // 2. Chips 간의 간격 (Uniform 배치용)
      chips.slice(i + 1).forEach(c2 => {
        // 수평 간격
        if (Math.abs(c1.y - c2.y) < boundary.height / 20) {
          const startX = Math.min(c1.x + c1.width, c2.x + c2.width);
          const endX = Math.max(c1.x, c2.x);
          if (Math.abs(startX - endX) > boundary.width / 50) { // 일정 거리 이상
            newLaneElements.push(new LaneElement({x: startX, y: (c1.y + c1.height/2 + c2.y + c2.height/2)/2}, {x: endX, y: (c1.y + c1.height/2 + c2.y + c2.height/2)/2}));
          }
        }
      });
    });

    setScribelane(prev => prev ? new ScribelaneStructure(prev.boundary, prev.chips, newLaneElements) : null);
    toast({ title: "Scribelane 분석 완료", status: "success", duration: 2000 });
  };

  // 6. 최적 공간 배치 알고리즘 (N개, 겹치지 않게)
  const placeElementsN = () => {
    if (!scribelane || scribelane.laneElements.length === 0) {
      toast({ title: "먼저 Scribelane 분석을 실행하세요.", status: "warning", duration: 3000 });
      return;
    }
    const { boundary, laneElements } = scribelane;
    const newPlacedElements: PlacedElement[] = [];
    const occupiedPositions: Set<string> = new Set(); // 겹침 방지용

    const isOverlap = (p: Point, radius: number) => {
      const posKey = `${Math.round(p.x/radius)},${Math.round(p.y/radius)}`; // 격자 기반 체크
      if (occupiedPositions.has(posKey)) return true;
      occupiedPositions.add(posKey);
      return false;
    }

    const radius = Math.min(boundary.width, boundary.height) / 100; // 배치 요소 크기

    // 옵션 1: Center
    if (placementOptions.placeAtCenter) {
      const center: Point = { x: boundary.x + boundary.width / 2, y: boundary.y + boundary.height / 2 };
      if (!isOverlap(center, radius)) newPlacedElements.push({ id: uuidv4(), position: center, sourceId: 'center' });
    }

    // 옵션 2: Corners
    if (placementOptions.placeAtCorners) {
      const offset = radius * 2;
      const corners: Point[] = [
        {x: boundary.x + offset, y: boundary.y + offset},
        {x: boundary.x + boundary.width - offset, y: boundary.y + offset},
        {x: boundary.x + boundary.width - offset, y: boundary.y + boundary.height - offset},
        {x: boundary.x + offset, y: boundary.y + boundary.height - offset}
      ];
      corners.forEach(p => { if(!isOverlap(p, radius)) newPlacedElements.push({ id: uuidv4(), position: p, sourceId: 'corner' }); });
    }

    // 옵션 3: Uniform (N개 중 남은 수량을 Chips 사이 골고루 배치)
    if (placementOptions.placeUniformly) {
      const remainingN = placementN - newPlacedElements.length;
      if (remainingN > 0) {
        // LaneElements의 중심점에 골고루 배치
        for (let i = 0; i < remainingN; i++) {
          const source = laneElements[i % laneElements.length]; // 순환 배치
          // 선분 내부에서 랜덤 위치 (간소화)
          const p = source.center;
          if (!isOverlap(p, radius)) newPlacedElements.push({ id: uuidv4(), position: p, sourceId: source.id });
        }
      }
    }

    setPlacedElements(newPlacedElements);
    toast({ title: `${newPlacedElements.length}개 요소 배치 완료`, status: "success", duration: 2000 });
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return (
    <ChakraProvider theme={theme}>
      <Flex h="100vh" bg="gray.900" color="white" overflow="hidden">
        {/* Sidebar */}
        <VStack w="380px" bg="gray.800" borderRight="1px solid" borderColor="gray.700" p={6} align="stretch" spacing={6} overflowY="auto">
          <Box>
            <Heading size="md" color="emerald.400 tracking-tight">SCRIBELANE PRO</Heading>
            <Text fontSize="xs" color="gray.500" mt={1}>Image Paste <Kbd>Ctrl+V</Kbd> and Analyze</Text>
          </Box>
          <Divider borderColor="gray.700" />

          {/* Step 1: Object List */}
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text fontWeight="bold" fontSize="sm">1. OBJECT LIST</Text>
              <Badge colorScheme="green">{scribelane ? scribelane.chips.length + 1 : 0}</Badge>
            </HStack>
            {scribelane && (
              <Box p={3} bg="gray.950" rounded="md" borderLeft="4px solid" borderColor="green.400">
                <Text fontSize="xs" fontWeight="bold">BOUNDARY (Main)</Text>
                <Text fontSize="10px" color="gray.500">{scribelane.boundary.width} x {scribelane.boundary.height}</Text>
              </Box>
            )}
            {scribelane?.chips.map((chip, idx) => (
              <HStack key={chip.id} p={2} bg="gray.700" rounded="md" justify="space-between">
                <Text fontSize="xs">CHIP #{idx + 1} {chip.isManual && "(Manual)"}</Text>
                <Badge colorScheme={chip.isManual ? "yellow" : "green"} fontSize="10px">{chip.width}x{chip.height}</Badge>
              </HStack>
            ))}
          </VStack>

          {/* Step 2: Scribelane Analyze */}
          <VStack align="stretch" spacing={3}>
            <Text fontWeight="bold" fontSize="sm">2. SCRIBELANE ANALYZE</Text>
            <Button size="sm" colorScheme="emerald" leftIcon={<CheckCircleIcon />} onClick={analyzeScribelane} isDisabled={!scribelane}>
              Analyze & Linearize
            </Button>
            <Text fontSize="xs" color="gray.500">Lanes: <Badge>{scribelane?.laneElements.length || 0}</Badge></Text>
          </VStack>

          {/* Step 3: N Placement */}
          <VStack align="stretch" spacing={4} p={4} bg="gray.950" rounded="lg">
            <Text fontWeight="bold" fontSize="sm">3. N-PLACEMENT (겹침 방지)</Text>
            <NumberInput size="sm" defaultValue={10} min={1} max={500} onChange={val => setPlacementN(Number(val))}>
              <NumberInputField />
            </NumberInput>
            <Stack spacing={2} fontSize="sm">
              <Checkbox size="sm" isChecked={placementOptions.placeAtCenter} onChange={e => setPlacementOptions({...placementOptions, placeAtCenter: e.target.checked})}>Scribelane Center (1)</Checkbox>
              <Checkbox size="sm" isChecked={placementOptions.placeAtCorners} onChange={e => setPlacementOptions({...placementOptions, placeAtCorners: e.target.checked})}>Boundary Corners (4)</Checkbox>
              <Checkbox size="sm" isChecked={placementOptions.placeUniformly} onChange={e => setPlacementOptions({...placementOptions, placeUniformly: e.target.checked})}>Uniform (Chips Gap)</Checkbox>
            </Stack>
            <Button size="sm" colorScheme="blue" leftIcon={<AddIcon />} onClick={placeElementsN} isDisabled={!scribelane || scribelane.laneElements.length === 0}>
              Apply Placement (N)
            </Button>
          </VStack>
        </VStack>

        {/* Main Canvas */}
        <Flex flex={1} bg="gray.950" direction="column" align="center" justify="center" p={10} position="relative">
          <HStack position="absolute" top={6} spacing={4}>
            <Badge colorScheme="emerald">Detected</Badge>
            <Badge colorScheme="yellow">Manual</Badge>
            <Badge colorScheme="blue">Placed</Badge>
          </HStack>

          <Box boxShadow="dark-lg" rounded="xl" overflow="auto" border="2px solid" borderColor="gray.700" cursor={image ? "crosshair" : "default"} maxW="full" maxH="full" bg="black">
            {image ? (
              <Stage 
                width={image.width} 
                height={image.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <Layer>
                  <KonvaImage image={image} opacity={0.6} />
                  
                  {scribelane && (
                    <>
                      {/* Boundary Rect */}
                      <KonvaRect {...scribelane.boundary} stroke="#10b981" strokeWidth={4} fill="rgba(16, 185, 129, 0.05)" dash={[10, 5]} />
                      
                      {/* Chips Rects */}
                      {scribelane.chips.map(chip => (
                        <KonvaRect key={chip.id} {...chip} stroke={chip.isManual ? "#ECC94B" : "#48BB78"} strokeWidth={2} fill={chip.isManual ? "rgba(236, 201, 75, 0.1)" : "rgba(72, 187, 120, 0.1)"}/>
                      ))}

                      {/* Lane Elements (직선 선분 리스트) */}
                      {scribelane.laneElements.map(lane => (
                        <KonvaLine key={lane.id} points={[lane.line.p1.x, lane.line.p1.y, lane.line.p2.x, lane.line.p2.y]} stroke="white" strokeWidth={1} opacity={0.5}/>
                      ))}
                    </>
                  )}

                  {/* Placing Temp Rect */}
                  {tempRect && (
                    <KonvaRect {...tempRect} stroke="#ECC94B" strokeWidth={1} dash={[5, 5]} />
                  )}

                  {/* Placed N Elements (겹침 방지된 요소들) */}
                  {placedElements.map(el => (
                    <KonvaCircle key={el.id} x={el.position.x} y={el.position.y} radius={Math.min(scribelane!.boundary.width, scribelane!.boundary.height)/100} fill="#3182CE" stroke="#63B3ED" strokeWidth={2} opacity={0.8}/>
                  ))}
                </Layer>
              </Stage>
            ) : (
              <Center w="800px" h="600px" color="gray.600" flexDirection="column">
                <Text fontSize="5xl">📋</Text>
                <Text mt={4} textTransform="uppercase" fontWeight="bold">Paste <Kbd>Ctrl+V</Kbd> image</Text>
                <Text fontSize="sm" mt={1}>Rectangle + Scribelane Detection</Text>
              </Center>
            )}
          </Box>
        </Flex>
      </Flex>
    </ChakraProvider>
  );
};

export default App;