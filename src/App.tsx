import React, { useState, useRef, useEffect } from 'react';
import KonvaCanvas from './index';
import { Iinfo, IaddItem, IFunc } from './type';

const App = () => {
  const [stepInfo, setStepInfo] = useState<Iinfo[]>([]);
  const [selectedItem, setSelectedItem] = useState<Iinfo | null>(null);
  const [addItem, setAddItem] = useState<IaddItem | undefined>(undefined);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [selectedItemChange, setSelectedItemChange] = useState<any>(null);


  const konvaCanvasRef = useRef<IFunc | null>(null);

  const handleCanvasChange = (newStepInfo: Iinfo[]) => {
    // 深度比较，防止不必要的渲染循环
    if (JSON.stringify(stepInfo) !== JSON.stringify(newStepInfo)) {
      setStepInfo(newStepInfo);
    }
  };

  // 消费 addItem prop，防止无限循环
  useEffect(() => {
    if (addItem) {
      setAddItem(undefined);
    }
  }, [addItem]);

  // 消费 selectedItemChange prop，防止无限循环
  useEffect(() => {
    if (selectedItemChange) {
      setSelectedItemChange(null);
    }
  }, [selectedItemChange]);

  const handleAddText = () => {
    setAddItem({
      type: 'text',
      value: '双击编辑文字',
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAddItem({
        type: 'image',
        value: URL.createObjectURL(file),
      });
    }
    // a-b
    // 清空 input 的值，以便可以重复上传同一张图片
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleAddShape = () => {
    setAddItem({
        type: 'shape',
        value: 'star',
    });
  }

  const handleUndo = () => konvaCanvasRef.current?.withdraw();
  const handleRedo = () => konvaCanvasRef.current?.redo();
  const handleDelete = () => konvaCanvasRef.current?.deleteItem();
  const handleMoveLayerUp = () => {
    if (!selectedItem) return;
    const index = stepInfo.findIndex((item) => item.id === selectedItem.id);
    if (index < stepInfo.length - 1 && index !== -1) {
      const newStepInfo = [...stepInfo];
      const temp = newStepInfo[index];
      newStepInfo[index] = newStepInfo[index + 1];
      newStepInfo[index + 1] = temp;
      setStepInfo(newStepInfo);
    }
  };

  const handleMoveLayerDown = () => {
    if (!selectedItem) return;
    const index = stepInfo.findIndex((item) => item.id === selectedItem.id);
    if (index > 0) {
      const newStepInfo = [...stepInfo];
      const temp = newStepInfo[index];
      newStepInfo[index] = newStepInfo[index - 1];
      newStepInfo[index - 1] = temp;
      setStepInfo(newStepInfo);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', gap: '10px' }}>
        <button onClick={handleUndo}>撤销</button>
        <button onClick={handleRedo}>重做</button>
        <button onClick={handleDelete} disabled={!selectedItem}>删除</button>
      </div>
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ width: '200px', borderRight: '1px solid #ccc', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2>工具栏</h2>
          <button onClick={handleAddText}>添加文字</button>
          <button onClick={handleAddImage}>上传图片</button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
          <button onClick={handleAddShape}>添加星形</button>
          <hr />
          <button onClick={handleMoveLayerUp} disabled={!selectedItem}>上移图层</button>
          <button onClick={handleMoveLayerDown} disabled={!selectedItem}>下移图层</button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
          <KonvaCanvas
            backgroundStyle={{
              backgroundColor: '#F1F3F7',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            width={canvasWidth}
            height={canvasHeight}
            backgroundColor={backgroundColor}
            stepInfo={stepInfo}
            addItem={addItem}
            selectedItemChange={selectedItemChange}
            onChangeStep={handleCanvasChange}
            onChangeSelected={setSelectedItem}
            bindRef={(ref) => (konvaCanvasRef.current = ref)}
          />
        </div>
        <div style={{ width: '250px', borderLeft: '1px solid #ccc', padding: '10px' }}>
          <h2>属性</h2>
          <div>
            <h3>画布</h3>
            <label>宽度: </label>
            <input type="number" value={canvasWidth} onChange={(e) => setCanvasWidth(parseInt(e.target.value, 10))} />
            <br />
            <label>高度: </label>
            <input type="number" value={canvasHeight} onChange={(e) => setCanvasHeight(parseInt(e.target.value, 10))} />
            <br />
            <label>背景色: </label>
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
          </div>
          {selectedItem && (
            <div>
              <h3>选中元素 (ID: {selectedItem.id})</h3>
              {/* 公共属性 */}
              <div>
                <label>X: </label>
                <input
                  type="number"
                  value={selectedItem.x || 0}
                  onChange={(e) => setSelectedItemChange({ id: selectedItem.id, x: parseInt(e.target.value, 10) } as any)}
                />
              </div>
              <div>
                <label>Y: </label>
                <input
                  type="number"
                  value={selectedItem.y || 0}
                  onChange={(e) => setSelectedItemChange({ id: selectedItem.id, y: parseInt(e.target.value, 10) } as any)}
                />
              </div>
              <div>
                <label>Rotation: </label>
                <input
                  type="number"
                  value={(selectedItem as any).rotation || 0}
                  onChange={(e) => setSelectedItemChange({ id: selectedItem.id, rotation: parseInt(e.target.value, 10) } as any)}
                />
              </div>
               <div>
                <label>Scale: </label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedItem.scaleX || 1}
                  onChange={(e) => {
                    const scale = parseFloat(e.target.value);
                    setSelectedItemChange({ id: selectedItem.id, scaleX: scale, scaleY: scale } as any)}
                  }
                />
              </div>

              {/* 文本特有属性 */}
              {selectedItem.type === 'text' && (
                <>
                  <div>
                    <label>内容: </label>
                    <input
                      type="text"
                      value={(selectedItem as any).value || ''}
                      onChange={(e) => setSelectedItemChange({ id: selectedItem.id, value: e.target.value } as any)}
                    />
                  </div>
                  <div>
                    <label>字号: </label>
                    <input
                      type="number"
                      value={(selectedItem as any).fontSize || 20}
                      onChange={(e) => setSelectedItemChange({ id: selectedItem.id, fontSize: parseInt(e.target.value, 10) } as any)}
                    />
                  </div>
                  <div>
                    <label>颜色: </label>
                    <input
                      type="color"
                      value={(selectedItem as any).fill || '#000000'}
                      onChange={(e) => setSelectedItemChange({ id: selectedItem.id, fill: e.target.value } as any)}
                    />
                  </div>
                  <div>
                    <label>斜体: </label>
                    <input
                      type="checkbox"
                      checked={(selectedItem as any).fontStyle === 'italic'}
                      onChange={(e) => setSelectedItemChange({ id: selectedItem.id, fontStyle: e.target.checked ? 'italic' : 'normal' } as any)}
                    />
                  </div>
                  <div>
                    <label>描边颜色: </label>
                    <input
                      type="color"
                      value={(selectedItem as any).stroke || '#000000'}
                      onChange={(e) => setSelectedItemChange({ id: selectedItem.id, stroke: e.target.value } as any)}
                    />
                  </div>
                  <div>
                    <label>描边宽度: </label>
                    <input
                      type="number"
                      value={(selectedItem as any).strokeWidth || 0}
                      onChange={(e) => setSelectedItemChange({ id: selectedItem.id, strokeWidth: parseInt(e.target.value, 10) } as any)}
                    />
                  </div>
                </>
              )}

              {/* 形状特有属性 */}
              {selectedItem.type === 'shape' && (
                <div>
                  <label>填充色: </label>
                  <input
                    type="color"
                    value={(selectedItem as any).fill || '#000000'}
                    onChange={(e) => setSelectedItemChange({ id: selectedItem.id, fill: e.target.value } as any)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;