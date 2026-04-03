
        let scene, camera, renderer, controls;
        let originalGroup, transformedRawGroup, projectedGroup;
        
        // 原始二维多边形（正方形）
        let originalPolygon = [
            [-1, -1], [1, -1], [1, 1], [-1, 1]
        ];

        function init() {
            renderPolygonInputs();
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x1a1a2e);

            const container = document.getElementById('container');
            const w = container.clientWidth, h = container.clientHeight;
            
            camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
            camera.position.set(4, 3, 4);
            camera.lookAt(0, 0.5, 0);

            renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setSize(w, h);
            container.appendChild(renderer.domElement);

            // 灯光
            const ambient = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambient);
            const directional = new THREE.DirectionalLight(0xffffff, 0.8);
            directional.position.set(5, 10, 5);
            scene.add(directional);

            // 坐标系 - 纯白色
            const axesHelper = new THREE.AxesHelper(3);
            // 修改 geometry 的 color attribute 为白色
            const colors = axesHelper.geometry.attributes.color;
            for (let i = 0; i < colors.count; i++) {
                colors.setXYZ(i, 1, 1, 1);
            }
            colors.needsUpdate = true;
            scene.add(axesHelper);

            // 坐标轴标签（暂时禁用）
            // scene.add(createLabel('X', new THREE.Vector3(3.2, 0, 0)));
            // scene.add(createLabel('Y', new THREE.Vector3(0, 3.2, 0)));
            // scene.add(createLabel('Z', new THREE.Vector3(0, 0, 3.2)));

            // z=1 平面参考
            const planeGeom = new THREE.PlaneGeometry(4, 4);
            const planeMat = new THREE.MeshBasicMaterial({color: 0x444466, transparent: true, opacity: 0.3, side: THREE.DoubleSide});
            const plane = new THREE.Mesh(planeGeom, planeMat);
            plane.rotation.x = Math.PI / 2;
            plane.position.y = 1;
            scene.add(plane);

            // 创建多边形组
            originalGroup = new THREE.Group();
            transformedRawGroup = new THREE.Group();
            projectedGroup = new THREE.Group();
            scene.add(originalGroup);
            scene.add(transformedRawGroup);
            scene.add(projectedGroup);

            // 事件监听
            document.getElementById('elev').addEventListener('input', updateCamera);
            document.getElementById('azim').addEventListener('input', updateCamera);
            window.addEventListener('resize', onResize);

            // 矩阵输入实时更新
            document.querySelectorAll('.matrix-grid input').forEach(input => {
                input.addEventListener('input', () => {
                    isUpdatingFromMatrix = true;
                    updateTransform();
                    isUpdatingFromMatrix = false;
                });
            });

            // 滚动条实时更新
            ['tx','ty','rotate','sx','sy','shx','shy','px','py','tz'].forEach(id => {
                document.getElementById(id).addEventListener('input', () => {
                    isUpdatingFromSliders = false;
                    updateTransform();
                });
            });

            // 鼠标控制
            let isDragging = false, prevX, prevY;
            container.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
            container.addEventListener('mouseup', () => isDragging = false);
            container.addEventListener('mousemove', e => {
                if (!isDragging) return;
                const dx = e.clientX - prevX, dy = e.clientY - prevY;
                const r = Math.sqrt(camera.position.x**2 + camera.position.z**2);
                const angle = Math.atan2(camera.position.z, camera.position.x) + dx * 0.01;
                camera.position.x = r * Math.cos(angle);
                camera.position.z = r * Math.sin(angle);
                camera.position.y = Math.max(0.1, camera.position.y + dy * 0.02);
                camera.lookAt(0, 0.5, 0);
                prevX = e.clientX; prevY = e.clientY;
            });

            updateTransform();
            animate();
        }

        let isUpdatingFromSliders = false;
        let isUpdatingFromMatrix = false;

        function getMatrix() {
            // 如果正在从矩阵输入框更新，不读取滚动条
            if (isUpdatingFromMatrix) {
                return [
                    [parseFloat(document.getElementById('m00').value), parseFloat(document.getElementById('m01').value), parseFloat(document.getElementById('m02').value)],
                    [parseFloat(document.getElementById('m10').value), parseFloat(document.getElementById('m11').value), parseFloat(document.getElementById('m12').value)],
                    [parseFloat(document.getElementById('m20').value), parseFloat(document.getElementById('m21').value), parseFloat(document.getElementById('m22').value)]
                ];
            }

            // 从滚动条计算矩阵
            const tx = parseFloat(document.getElementById('tx').value);
            const ty = parseFloat(document.getElementById('ty').value);
            const rotate = parseFloat(document.getElementById('rotate').value) * Math.PI / 180;
            const sx = parseFloat(document.getElementById('sx').value);
            const sy = parseFloat(document.getElementById('sy').value);
            const shx = parseFloat(document.getElementById('shx').value);
            const shy = parseFloat(document.getElementById('shy').value);
            const px = parseFloat(document.getElementById('px').value);
            const py = parseFloat(document.getElementById('py').value);
            const tz = parseFloat(document.getElementById('tz').value);

            const T = [[1, 0, tx], [0, 1, ty], [0, 0, 1]];
            const R = [[Math.cos(rotate), -Math.sin(rotate), 0], [Math.sin(rotate), Math.cos(rotate), 0], [0, 0, 1]];
            const S = [[sx, 0, 0], [0, sy, 0], [0, 0, 1]];
            const Sh = [[1, shx, 0], [shy, 1, 0], [0, 0, 1]];
            const P = [[1, 0, 0], [0, 1, 0], [px, py, 1]]; // 透视矩阵

            // Z轴距离：修改 P 矩阵的 [2][2]
            P[2][2] = 1 + tz;

            function mul(A, B) {
                const C = [[0,0,0],[0,0,0],[0,0,0]];
                for (let i = 0; i < 3; i++)
                    for (let j = 0; j < 3; j++)
                        for (let k = 0; k < 3; k++)
                            C[i][j] += A[i][k] * B[k][j];
                return C;
            }
            return mul(mul(mul(mul(P, Sh), S), R), T);
        }

        function syncMatrixToInputs(matrix) {
            isUpdatingFromSliders = true;
            document.getElementById('m00').value = matrix[0][0].toFixed(2);
            document.getElementById('m01').value = matrix[0][1].toFixed(2);
            document.getElementById('m02').value = matrix[0][2].toFixed(2);
            document.getElementById('m10').value = matrix[1][0].toFixed(2);
            document.getElementById('m11').value = matrix[1][1].toFixed(2);
            document.getElementById('m12').value = matrix[1][2].toFixed(2);
            document.getElementById('m20').value = matrix[2][0].toFixed(2);
            document.getElementById('m21').value = matrix[2][1].toFixed(2);
            document.getElementById('m22').value = matrix[2][2].toFixed(2);
            isUpdatingFromSliders = false;
        }

        function syncSlidersFromMatrix(matrix) {
            // 从矩阵反向解析参数（简化版）
            // 这只是个近似，主要用于让用户看到矩阵变化
            isUpdatingFromMatrix = true;
            // 平移
            document.getElementById('tx').value = matrix[0][2];
            document.getElementById('ty').value = matrix[1][2];
            // 缩放
            document.getElementById('sx').value = Math.sqrt(matrix[0][0]**2 + matrix[1][0]**2);
            document.getElementById('sy').value = Math.sqrt(matrix[0][1]**2 + matrix[1][1]**2);
            // 旋转（简化）
            document.getElementById('rotate').value = Math.atan2(matrix[1][0], matrix[0][0]) * 180 / Math.PI;
            isUpdatingFromMatrix = false;
        }

        function perspectiveTransform2DTo3D(points2D, matrix) {
            const n = points2D.length;
            const results = { raw: [], projected: [], projected2D: [] };
            
            for (const [x, y] of points2D) {
                // 齐次坐标 (x, y, 1)
                const wx = matrix[0][0]*x + matrix[0][1]*y + matrix[0][2];
                const wy = matrix[1][0]*x + matrix[1][1]*y + matrix[1][2];
                const ww = matrix[2][0]*x + matrix[2][1]*y + matrix[2][2];
                
                results.raw.push([wx, wy, ww]);
                
                const w = Math.abs(ww) < 1e-10 ? 1e-10 : ww;
                results.projected2D.push([wx/w, wy/w]);
                results.projected.push([wx/w, wy/w, 1]);
            }
            return results;
        }

        function clearGroup(group) {
            while(group.children.length) {
                group.remove(group.children[0]);
            }
        }

        function addPolygon(group, points, color, size = 0.08) {
            // 点
            points.forEach(([x, y, z]) => {
                const geom = new THREE.SphereGeometry(size, 16, 16);
                const mat = new THREE.MeshPhongMaterial({color});
                group.add(new THREE.Mesh(geom, mat));
                group.children[group.children.length-1].position.set(x, y, z);
            });
            
            // 线（闭合）
            if (points.length > 1) {
                const closed = [...points, points[0]];
                const pts = closed.map(p => new THREE.Vector3(p[0], p[1], p[2]));
                const geom = new THREE.BufferGeometry().setFromPoints(pts);
                const mat = new THREE.LineBasicMaterial({color, transparent: true, opacity: 0.7});
                group.add(new THREE.Line(geom, mat));
            }
        }

        function addDashedLine(group, points) {
            const origin = new THREE.Vector3(0, 0, 0);
            points.forEach(([x, y, z]) => {
                const far = new THREE.Vector3(x, y, z);
                const geom = new THREE.BufferGeometry().setFromPoints([origin, far]);
                const mat = new THREE.LineDashedMaterial({color: 0x666666, dashSize: 0.1, gapSize: 0.05});
                const line = new THREE.Line(geom, mat);
                line.computeLineDistances();
                group.add(line);
            });
        }

        function updateTransform() {
            const matrix = getMatrix();
            const result = perspectiveTransform2DTo3D(originalPolygon, matrix);
            
            // 同步矩阵到输入框
            syncMatrixToInputs(matrix);
            
            // 清理旧内容
            clearGroup(originalGroup);
            clearGroup(transformedRawGroup);
            clearGroup(projectedGroup);

            // 原始多边形 (z=1)
            const original3D = originalPolygon.map(([x, y]) => [x, y, 1]);
            addPolygon(originalGroup, original3D, 0x0088ff);
            
            // 变换后3D
            addPolygon(transformedRawGroup, result.raw, 0xff4444);
            
            // 投影 (z=1)
            addPolygon(projectedGroup, result.projected, 0x44ff44);
            
            // 虚线连接
            const dashedPoints = result.raw.map((pt, i) => {
                const w = pt[2];
                return w >= 1 ? pt : result.projected[i];
            });
            addDashedLine(originalGroup, dashedPoints);

            // 更新信息
            const formatPoints = (arr) => arr.map(p => `${p[0].toFixed(2)}\t${p[1].toFixed(2)}\t${p[2] !== undefined ? p[2].toFixed(2) : ''}`).join('\n');
            document.getElementById('result').innerHTML = 
                `<strong>变换后3D:</strong>\n<pre>${formatPoints(result.raw)}</pre>` +
                `<strong>投影3D(z=1):</strong>\n<pre>${formatPoints(result.projected)}</pre>`;
        }

        function resetAll() {
            // 重置滚动条
            ['tx','ty','rotate','sx','sy','shx','shy','px','py','tz'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = id === 'sx' || id === 'sy' ? 1 : 0;
            });
            // 重置多边形
            originalPolygon = [[-1,-1], [1,-1], [1,1], [-1,1]];
            renderPolygonInputs();
            resetMatrix();

        function resetMatrix() {
            document.getElementById('m00').value = 1;
            document.getElementById('m01').value = 0;
            document.getElementById('m02').value = 0;
            document.getElementById('m10').value = 0;
            document.getElementById('m11').value = 1;
            document.getElementById('m12').value = 0;
            document.getElementById('m20').value = 0;
            document.getElementById('m21').value = 0;
            document.getElementById('m22').value = 1;
            updateTransform();
        }

        function renderPolygonInputs() {
            const container = document.getElementById('polygon-inputs');
            container.innerHTML = originalPolygon.map((p, i) => 
                `<div class="point-input">
                    <span>P${i}:</span>
                    <input type="number" step="0.1" value="${p[0]}" id="px${i}">
                    <input type="number" step="0.1" value="${p[1]}" id="py${i}">
                </div>`
            ).join('');
        }

        function addPoint() {
            const last = originalPolygon[originalPolygon.length - 1];
            originalPolygon.push([last[0] + 0.5, last[1] + 0.5]);
            renderPolygonInputs();
        }

        function removePoint() {
            if (originalPolygon.length > 3) {
                originalPolygon.pop();
                renderPolygonInputs();
            }
        }

        function updatePolygon() {
            originalPolygon = originalPolygon.map((_, i) => [
                parseFloat(document.getElementById(`px${i}`).value),
                parseFloat(document.getElementById(`py${i}`).value)
            ]);
            updateTransform();
        }

        function updateCamera() {
            const elev = parseFloat(document.getElementById('elev').value) * Math.PI / 180;
            const azim = parseFloat(document.getElementById('azim').value) * Math.PI / 180;
            const r = 5;
            camera.position.x = r * Math.cos(elev) * Math.sin(azim);
            camera.position.y = r * Math.sin(elev) + 1;
            camera.position.z = r * Math.cos(elev) * Math.cos(azim);
            camera.lookAt(0, 0.5, 0);
        }

        function onResize() {
            const container = document.getElementById('container');
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }

        init();
    