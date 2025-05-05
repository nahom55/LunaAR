
 //device declaratio
        let currentCategory = null;
        let selectedModel = null; // Track the currently selected model
        let modelCount = 0; // Track the number of models loaded
// home js
        // Toggle navigation menu
        
        
       
        
        const hamburgerMenu = document.getElementById("hamburger-menu");
        const navMenu = document.getElementById("nav-menu");

        hamburgerMenu.addEventListener("click", () => {
            navMenu.style.display = navMenu.style.display === "block" ? "none" : "block";
        });

        // Function to load page content
        function loadPage(page) {
            fetch(page)
                .then(response => response.text())
                .then(data => {
                    // console.log(data);
                    const conatiner= document.querySelector("#content-area");
                    conatiner.textContent='';
                    conatiner.innerHTML=data;
                    console.log(conatiner.innerHTML);
                    

                    
                    // Create a temporary container to parse the fetched HTML
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = data;
        
                    // Extract styles
                    const newStyles = tempDiv.querySelectorAll('link[rel="stylesheet"], style');
                    newStyles.forEach(style => {
                        document.head.appendChild(style.cloneNode(true));
                    });
        
                    // Extract scripts
                    const newScripts = tempDiv.querySelectorAll('script');
                    newScripts.forEach(script => {
                        const newScript = document.createElement('script');
                        if (script.src) {
                            newScript.src = script.src;
                            newScript.async = false;
                        } else {
                            newScript.textContent = script.textContent;
                        }
                        document.body.appendChild(newScript);
                    });
        
                    // Get the new A-Frame content (only the a-entity parts)
                    const newEntities = tempDiv.querySelectorAll('a-entity');
        
                    // Find the existing A-Frame scene
                    const scene = document.querySelector('a-scene');
                    if (scene) {
                        // Remove current a-entity elements inside the scene
                        scene.innerHTML = '';
        
                        // Append the new a-entity elements
                        newEntities.forEach(entity => {
                            scene.appendChild(entity.cloneNode(true));
                        });
        
                        console.log("Updated A-Frame scene with new entities.");
                    } else {
                        console.error("A-Frame scene not found!");
                    }
        
                    // Replace content in #content-area (excluding A-Frame elements)
                    document.getElementById('content-area').innerHTML = tempDiv.innerHTML;
                })
                .catch(error => console.error('Error loading page:', error));
        }
        

        // Function to initialize AR content
        function initializeARContent(scene) {
            // Add a 3D Human Model
            const humanModel = document.createElement('a-entity');
            humanModel.setAttribute('id', 'human-model');
            humanModel.setAttribute('gltf-model', 'url(aaa22.glb)');
            humanModel.setAttribute('scale', '0.025 0.025 0.025');
            humanModel.setAttribute('position', '0 -1 -2');
            humanModel.setAttribute('animation-mixer', 'clip: *; timeScale: 0; loop: once');
            humanModel.setAttribute('visible', 'false');
            scene.appendChild(humanModel);

            // Add AR Buttons
            const serviceButtons = document.createElement('a-entity');
            serviceButtons.setAttribute('id', 'serviceButtons');
            serviceButtons.setAttribute('visible', 'false');
            scene.appendChild(serviceButtons);

            // Add Audio Element
            const audioElement = document.createElement('a-entity');
            audioElement.setAttribute('id', 'audioElement');
            audioElement.setAttribute('sound', 'src: url(cl.mp3); autoplay: false');
            scene.appendChild(audioElement);

            // Add Camera with cursor for interactions
            const camera = document.createElement('a-entity');
            camera.setAttribute('camera', '');
            camera.setAttribute('look-controls', '');
            const cursor = document.createElement('a-cursor');
            cursor.setAttribute('fuse', 'true');
            cursor.setAttribute('fuse-timeout', '500');
            cursor.setAttribute('geometry', 'primitive: ring; radiusInner: 0; radiusOuter: 0');
            camera.appendChild(cursor);
            scene.appendChild(camera);
        }

        // Function to play audio
        function playAudio() {
            const audioElement = document.getElementById("audioElement");
            audioElement.components.sound.playSound();
        }

        // Show the 3D model, start animation, and play audio after 10 seconds
        setTimeout(() => {
            const humanModel = document.getElementById("human-model");
            const audioElement = document.getElementById("audioElement");

            humanModel.setAttribute("visible", true); // Show the model
            humanModel.setAttribute("animation-mixer", "timeScale: 1"); // Start the animation
            playAudio(); // Play the audio
        }, 5000); // 5000 milliseconds = 5 seconds

        // Show AR buttons after 5 seconds
        setTimeout(() => {
            document.getElementById("serviceButtons").setAttribute("visible", true);
        }, 5000); // 5000 milliseconds = 5 seconds










// device js







        // Function to load 3D models
        function loadModel(modelName, descriptionItems) {
            const compareMode = document.getElementById('compare-checkbox').checked;

            // Calculate the position based on compare mode
            const position = compareMode
                ? { x: 0.8 * modelCount, y: 0, z: -1.5 } // Compare mode: increment X position only (reduced gap)
                : { x: -0.17, y: 0, z: -1.5 }; // Single mode: fixed position

            // Remove previous model if not in compare mode
            if (!compareMode) {
                const modelsContainer = document.getElementById('models-container');
                while (modelsContainer.firstChild) {
                    modelsContainer.removeChild(modelsContainer.firstChild);
                }
                modelCount = 0; // Reset model count
            }

            // 1. Create a new model entity
            const modelEntity = document.createElement('a-entity');
            modelEntity.setAttribute('gltf-model', `${modelName}.glb`);
            modelEntity.setAttribute('position', position);
            modelEntity.setAttribute('scale', '0.005 0.005 0.005'); // Adjusted for visibility

            // 2. Add rotation animation
            modelEntity.setAttribute('animation', {
                property: 'rotation',
                to: '0 360 0',
                loop: true,
                dur: 10000,
                easing: 'linear'
            });

            // 3. Add click handler for selection
            modelEntity.addEventListener('click', (e) => {
                e.stopPropagation();
                if (selectedModel) {
                    selectedModel.removeAttribute('draggable');
                }
                selectedModel = modelEntity;
                modelEntity.setAttribute('draggable', '');
            });

            // 4. Add model to the scene
            document.getElementById('models-container').appendChild(modelEntity);

            // 5. Create a text plane for the description
            const textPlane = document.createElement('a-entity');
            textPlane.setAttribute('geometry', {
                primitive: 'plane',
                width: 0.3, // Reduced width
                height: 0.32 // Reduced height
            });
            textPlane.setAttribute('material', {
                color: 'white',
                opacity: 0.9
            });
            textPlane.setAttribute('position', {
                x: position.x + 0.32, // Place text plane next to the model (adjusted for reduced gap)
                y: position.y, // Move text plane slightly upward
                z: position.z
            });

            // 6. Add text to the text plane
            const title = document.createElement('a-text');
            title.setAttribute('value', 'Device Details');
            title.setAttribute('color', '#4CAF50');
            title.setAttribute('align', 'center');
            title.setAttribute('position', '-0.024 0.08 0.01'); // Move title slightly upward
            title.setAttribute('scale', '0.15 0.15 0.15');
            textPlane.appendChild(title);

            const ul = document.createElement('a-entity');
            descriptionItems.forEach((item, index) => {
                const li = document.createElement('a-text');
                li.setAttribute('value', item);
                li.setAttribute('color', '#333');
                li.setAttribute('align', 'left');
                li.setAttribute('position', `-0.12 ${-0.025 * index + 0.05} 0.01`); // Move text slightly upward
                li.setAttribute('scale', '0.076 0.076 0.076');
                ul.appendChild(li);
            });
            textPlane.appendChild(ul);

            // 7. Add the text plane to the scene
            document.getElementById('models-container').appendChild(textPlane);

            // Increment the model count
            modelCount++;
        }

        // Function to show model buttons based on category
        function showModelButtons(category) {
            currentCategory = category;
            // Hide all model buttons
            document.querySelectorAll('.model-buttons').forEach(buttonGroup => {
                buttonGroup.style.display = 'none';
            });

            // Hide category buttons
            document.getElementById('category-buttons').style.display = 'none';

            // Show the selected category's model buttons
            document.getElementById(`${category}-buttons`).style.display = 'flex';
        }

        // Function to go back to the main category buttons
        function goBack() {
            // Hide the model buttons and show the category buttons
            document.querySelectorAll('.model-buttons').forEach(buttonGroup => {
                buttonGroup.style.display = 'none';
            });
            document.getElementById('category-buttons').style.display = 'flex';
        }

        // Horizontal scrolling logic
        const camera = document.getElementById('camera');
        let isDragging = false;
        let startX = 0;
        let startY = 0;

        // Mouse events for desktop
        document.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                const cameraPosition = camera.getAttribute('position');
                camera.setAttribute('position', {
                    x: cameraPosition.x - deltaX * 0.01, // Adjust sensitivity
                    y: cameraPosition.y,
                    z: cameraPosition.z
                });
                startX = e.clientX;
                startY = e.clientY;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const deltaX = e.touches[0].clientX - startX;
                const deltaY = e.touches[0].clientY - startY;
                const cameraPosition = camera.getAttribute('position');
                camera.setAttribute('position', {
                    x: cameraPosition.x - deltaX * 0.01, // Adjust sensitivity
                    y: cameraPosition.y,
                    z: cameraPosition.z
                });
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });