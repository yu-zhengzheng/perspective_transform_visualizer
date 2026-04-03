#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
透视变换可视化脚本
输入：二维多边形 (n*2) 和透视变换矩阵 (3*3)
输出：透视变换后的3D结果和投影回z=1平面的结果，用matplotlib 3D渲染
"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D


def perspective_transform_2d_to_3d(points_2d, transform_matrix):
    """
    将二维点通过透视变换矩阵转换
    
    参数：
        points_2d: n*2 数组，二维点坐标 (x, y)
        transform_matrix: 3*3 透视变换矩阵
    
    返回：
        points_3d_raw: n*3 数组，透视变换后的3D点 (x', y', w) - 齐次坐标
        points_3d_projected: n*3 数组，投影回z=1平面的3D点 (x'/w, y'/w, 1)
        points_2d_projected: n*2 数组，投影回z=1平面的2D点 (x'/w, y'/w)
    """
    # 将2D点转换为齐次坐标 (x, y, 1)
    n = points_2d.shape[0]
    points_homogeneous = np.hstack([points_2d, np.ones((n, 1))])  # n*3
    
    # 应用透视变换矩阵 (3*3 @ 3*n -> 3*n, 然后转置为 n*3)
    points_transformed = (transform_matrix @ points_homogeneous.T).T  # n*3
    
    # 透视变换后的3D点 (x', y', w) - 直接矩阵运算结果
    points_3d_raw = points_transformed
    
    # 投影回z=1平面: (x'/w, y'/w, 1)
    w_coords = points_transformed[:, 2].reshape(-1, 1)
    w_coords = np.where(np.abs(w_coords) < 1e-10, 1e-10, w_coords)  # 避免除零
    
    points_2d_projected = points_transformed[:, :2] / w_coords
    points_3d_projected = np.hstack([points_2d_projected, np.ones((n, 1))])
    
    return points_3d_raw, points_3d_projected, points_2d_projected


def render_3d_visualization(original_points, transformed_3d_raw, transformed_3d_projected):
    """
    使用matplotlib渲染3D可视化（所有内容在同一个3D坐标系里）
    
    参数：
        original_points: 原始二维点 (n*2)
        transformed_3d_raw: 透视变换后的3D点 (n*3) - (x', y', w)
        transformed_3d_projected: 投影回z=1平面的3D点 (n*3) - (x'/w, y'/w, 1)
    """
    fig = plt.figure(figsize=(12, 10))
    ax = fig.add_subplot(111, projection='3d')
    
    # 原始多边形在z=1平面（蓝色）- 闭合多边形
    original_3d = np.hstack([original_points, np.ones((len(original_points), 1))])
    ax.scatter(original_3d[:, 0], original_3d[:, 1], original_3d[:, 2], 
              color='blue', s=100, label='Original Polygon (z=1)')
    if len(original_points) > 1:
        # 闭合多边形：首尾相连
        original_3d_closed = np.vstack([original_3d, original_3d[0]])
        ax.plot(original_3d_closed[:, 0], original_3d_closed[:, 1], original_3d_closed[:, 2], 
                color='blue', alpha=0.5, linewidth=2)
    
    # 透视变换后的3D点 (x', y', w)（红色）- 闭合多边形
    ax.scatter(transformed_3d_raw[:, 0], transformed_3d_raw[:, 1], transformed_3d_raw[:, 2], 
              color='red', s=100, label='Transformed 3D (x\',y\',w)')
    if len(transformed_3d_raw) > 1:
        # 闭合多边形：首尾相连
        transformed_3d_raw_closed = np.vstack([transformed_3d_raw, transformed_3d_raw[0]])
        ax.plot(transformed_3d_raw_closed[:, 0], transformed_3d_raw_closed[:, 1], transformed_3d_raw_closed[:, 2], 
                color='red', alpha=0.5, linewidth=2)
    
    # 投影回z=1平面的3D点 (x'/w, y'/w, 1)（绿色）- 闭合多边形
    ax.scatter(transformed_3d_projected[:, 0], transformed_3d_projected[:, 1], transformed_3d_projected[:, 2], 
              color='green', s=100, label='Projected (x\'/w,y\'/w,1)')
    if len(transformed_3d_projected) > 1:
        # 闭合多边形：首尾相连
        transformed_3d_projected_closed = np.vstack([transformed_3d_projected, transformed_3d_projected[0]])
        ax.plot(transformed_3d_projected_closed[:, 0], transformed_3d_projected_closed[:, 1], transformed_3d_projected_closed[:, 2], 
                color='green', alpha=0.5, linewidth=2)
    
    # 连接原点(0,0,0)到较远的点（透视变换点或投影点）的虚线（黑色）
    # 三点共线，原点(0,0,0)、透视变换点(x',y',w)、投影点(x'/w,y'/w,1)
    # 直接比较z坐标即可：w >= 1 用透视变换点，否则用投影点
    origin = np.array([0, 0, 0])
    for i in range(len(transformed_3d_raw)):
        w = transformed_3d_raw[i, 2]
        if w >= 1:
            far_point = transformed_3d_raw[i]
        else:
            far_point = transformed_3d_projected[i]
        ax.plot([origin[0], far_point[0]],
               [origin[1], far_point[1]],
               [origin[2], far_point[2]],
               'k--', linewidth=1)
    
    # 绘制z=1平面参考（半透明灰色，加深）
    xx, yy = np.meshgrid(np.linspace(-2, 2, 10), np.linspace(-2, 2, 10))
    zz = np.ones_like(xx)
    ax.plot_surface(xx, yy, zz, alpha=0.3, color='gray', label='z=1 Plane')
    
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    ax.set_title('Perspective Transform Visualization (All in One)', fontsize=14)
    ax.set_xlim([-2, 2])
    ax.set_ylim([-2, 2])
    ax.set_zlim([0, 2])
    ax.legend(loc='upper right')
    ax.view_init(elev=20, azim=45)
    
    plt.tight_layout()
    plt.show()


def main():
    # 示例：定义一个简单的二维多边形（正方形）
    original_polygon = np.array([
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1]
    ])
    
    # 示例：定义一个透视变换矩阵（简单的Z轴倾斜）
    transform_matrix = np.array([
        [1, 0.1, 0],
        [0, 1, 0.5],
        [0.2, 0.2, 1]
    ])
    
    print("输入参数：")
    print(f"二维多边形 (n*2):\n{original_polygon}")
    print(f"\n透视变换矩阵 (3*3):\n{transform_matrix}")
    
    # 计算透视变换
    transformed_3d_raw, transformed_3d_projected, projected_2d = perspective_transform_2d_to_3d(
        original_polygon, transform_matrix)
    
    print(f"\n透视变换后的3D点 (n*3) - 直接矩阵运算:\n{transformed_3d_raw}")
    print(f"\n投影回z=1平面的3D点 (n*3):\n{transformed_3d_projected}")
    print(f"\n投影回z=1平面的2D点 (n*2):\n{projected_2d}")
    
    # 渲染3D可视化（单图）
    render_3d_visualization(original_polygon, transformed_3d_raw, transformed_3d_projected)


if __name__ == "__main__":
    main()
