# 石門國中 3D 虛擬校園｜預覽版

這是一個可放到 GitHub Pages 的靜態 Three.js 網站，畫面資料取自使用者提供的 Arnis Minecraft Java 世界。此預覽保留世界中的方塊位置與主要材質顏色，讓校園底圖可以直接在瀏覽器中旋轉、縮放與俯視檢視。

## 目前已知資料

- Java 世界，`level.dat` 標示 Minecraft 1.21.4；區塊資料標籤為 DataVersion 3955。
- 一個區域檔含 1,024 個區塊，座標涵蓋 512 × 512 個方塊。
- 解碼後約 593,000 個非空方塊、88 種方塊材質。
- 世界地形設定是平坦地形；校舍與植被內容由 Arnis 產生，與真實校園的尺寸、位置仍需核對。
- 網頁預覽將方塊顯示為立方體，樓梯、門等特殊方塊狀態尚未還原。

## 本機預覽

必須透過本機網站伺服器開啟（瀏覽器的 `file://` 模式不能載入模組和壓縮資料）。在此資料夾執行：

```powershell
py -m http.server 8000
```

然後瀏覽 `http://localhost:8000`。

## 放到 GitHub Pages

1. 在 GitHub 建立新的 repository，將本資料夾中的檔案上傳到 repository 根目錄。
2. 開啟 repository 的 **Settings → Pages**。
3. 在 **Build and deployment** 將來源選為 **GitHub Actions**。
4. 推送檔案後，GitHub Actions 會部署網站；完成後 Pages 區域會顯示網址。

這個資料夾附有 `.github/workflows/pages.yml`，部署工作流程使用 GitHub Pages 官方 Actions。

## 教育版世界轉換

原始資料是 Java 世界，不能只把副檔名改成 `.mcworld`。可使用 Chunker 將 Java 世界轉成 Bedrock 世界格式，再從 Minecraft Education 匯入 `.mcworld`。這份世界尚未在 Chunker / Education 實際轉檔與開啟驗收；方塊對照、區塊高度與少數方塊狀態可能需要修正。請保留原始世界備份，另存轉換副本。

- Chunker 專案與支援格式：https://github.com/HiveGamesOSS/Chunker
- Minecraft `.mcworld` 格式說明：https://learn.microsoft.com/en-us/minecraft/creator/documents/minecraftfileextensions

## 專案檔案

- `index.html`：網頁內容與畫面
- `style.css`：版面與手機樣式
- `app.js`：Three.js 場景、操作與方塊材質
- `data/manifest.json`：世界標籤與模型索引
- `data/campus-mesh.bin.gz`：由原世界區塊資料產生的網頁模型
- `.github/workflows/pages.yml`：GitHub Pages 自動部署設定

網頁使用 Three.js r187 ES modules，從 jsDelivr 載入；使用者需在瀏覽器連線時可存取 CDN。

## 原始 ZIP 檢查結果

ZIP 中有 `metadata.json`、`level.dat`、`region/r.0.0.mca` 及世界圖示，屬於 Minecraft Java 世界資料夾的打包格式；不是 Bedrock 的 `.mcworld`。`metadata.json` 標示 `generator: arnis-mvp`、`format: minecraft-java`。`level.dat` 標示世界版本 1.21.4；區塊記錄自己的 DataVersion 是 3955，表示部分區塊資料版本早於世界主標籤，轉換或用不同版本開啟時應以副本操作並檢查地形。

這個區域檔含 1,024 個區塊，座標 0–31 × 0–31（每區塊 16 × 16 方塊），共 512 × 512 方塊。區塊中有 88 種非空材質，包括草地、石材、樹木、玻璃與建築方塊；所以有可供網頁製作的實際方塊資料，而不只是地圖圖像。世界生成器設定為平坦地形，不能提供真實校園高低起伏的證據。

教育版路徑：用 Chunker 將這份 Java 世界轉換為 Bedrock `.mcworld`，再匯入 Minecraft Education。微軟文件確認 `.mcworld` 是 Bedrock / Education 世界封裝格式；但此檔尚未經實際轉檔和 Education 開啟驗收，故本專案沒有附上未驗證的轉檔世界。
