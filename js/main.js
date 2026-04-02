/**
 * 主入口 - 初始化应用
 */

document.addEventListener('DOMContentLoaded', () => {
    // 创建渲染器
    const renderer = new Renderer('transformCanvas');
    
    // 创建 UI 控制器
    const ui = new UIController(renderer);
    
    // 初始渲染
    renderer.render(Matrix3.identity());
    
    console.log('🔷 仿射变换可视化已加载');
});
