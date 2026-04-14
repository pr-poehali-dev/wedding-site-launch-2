// Рендерит SVG зала в PNG base64. light=true — белый фон для печати.
export function renderHallPng(
  svgEl: SVGSVGElement,
  hallW: number,
  hallH: number,
  light: boolean,
  scale = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const w = hallW * scale;
    const h = hallH * scale;

    // Клонируем SVG и удаляем foreignObject до сериализации (canvas не поддерживает HTML в SVG)
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll("foreignObject").forEach(el => el.remove());

    const serializer = new XMLSerializer();
    let svgStr = serializer.serializeToString(clone);

    // Убираем внешние ресурсы (Google Fonts и т.п.) — они блокируют canvas из-за CORS
    svgStr = svgStr.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    svgStr = svgStr.replace(/<defs[^>]*>[\s\S]*?<\/defs>/gi, "");
    // Заменяем внешние шрифты на безопасный системный
    svgStr = svgStr.replace(/Montserrat,?\s*sans-serif/g, "Arial, sans-serif");
    svgStr = svgStr.replace(/Montserrat/g, "Arial");
    svgStr = svgStr.replace(/Cormorant[^"']*/g, "Georgia");

    if (light) {
      // Заменяем тёмный фон зала на белый
      svgStr = svgStr.replace(/fill="#110f0a"/g, 'fill="#ffffff"');
      svgStr = svgStr.replace(/fill="#1a160f"/g, 'fill="#f8f4ec"');
      svgStr = svgStr.replace(/fill="#1e1508"/g, 'fill="#f5f0e8"');
      svgStr = svgStr.replace(/fill="#2a2318"/g, 'fill="#e8e0d0"');
      svgStr = svgStr.replace(/fill="#2a3018"/g, 'fill="#d8ead8"');
      svgStr = svgStr.replace(/fill="#1e2a10"/g, 'fill="#d8ead8"');
      svgStr = svgStr.replace(/fill="#1a1d12"/g, 'fill="#eaeddc"');
      // Текст на схеме — тёмный
      svgStr = svgStr.replace(/fill="#f5edd8"/g, 'fill="#1a160f"');
      svgStr = svgStr.replace(/fill="#e8d5a3"/g, 'fill="#5a4a20"');
      svgStr = svgStr.replace(/fill="#c9a96e"/g, 'fill="#8b6a20"');
      svgStr = svgStr.replace(/fill="#c9a96e80"/g, 'fill="#8b6a2080"');
      svgStr = svgStr.replace(/stroke="#ffffff08"/g, 'stroke="#00000010"');
    }

    svgStr = svgStr.replace(
      /(<svg[^>]*?)(\s*>)/,
      `$1 width="${w}" height="${h}"$2`
    );

    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    const timer = setTimeout(() => { URL.revokeObjectURL(url); reject(new Error("SVG render timeout")); }, 10000);
    img.onload = () => {
      clearTimeout(timer);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = light ? "#ffffff" : "#110f0a";
      ctx.fillRect(0, 0, w, h);
      try {
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas tainted — cross-origin content"));
      }
    };
    img.onerror = () => { clearTimeout(timer); URL.revokeObjectURL(url); reject(new Error("SVG render failed")); };
    img.src = url;
  });
}