/**
 * Little Bean Story (강낭콩의 작은 이야기) - 인터랙티브 라이프 사이클 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 상태 관리 ---
  const state = {
    currentStep: 1,
    waterCount: 0,
    maxWater: 3,
    sunPosition: { x: 50, y: 30 }, // % 기준
    stemGrowth: 0, // 0 ~ 100
    isDraggingSun: false,
    diarySaved: false
  };

  // --- DOM 요소 캐싱 ---
  const statusMessage = document.getElementById('statusMessage');
  const progressFill = document.getElementById('progressFill');
  const stepNodes = [
    document.getElementById('stepNode1'),
    document.getElementById('stepNode2'),
    document.getElementById('stepNode3'),
    document.getElementById('stepNode4')
  ];

  const seedShelf = document.getElementById('seedShelf');
  const draggableSeed = document.getElementById('draggableSeed');
  const soilDropZone = document.getElementById('soilDropZone');
  const soilMound = document.getElementById('soilMound');
  const soilDropIndicator = document.getElementById('soilDropIndicator');

  const plantedSeedGroup = document.getElementById('plantedSeedGroup');
  const sproutGroup = document.getElementById('sproutGroup');
  const mainPlantSystem = document.getElementById('mainPlantSystem');
  const mainStem = document.getElementById('mainStem');
  const mainStemHighlight = document.getElementById('mainStemHighlight');
  const waterSapStream = document.getElementById('waterSapStream');
  const leavesCluster = document.getElementById('leavesCluster');
  const flowersCluster = document.getElementById('flowersCluster');
  const podsCluster = document.getElementById('podsCluster');

  const wateringEffects = document.getElementById('wateringEffects');
  const waterBtn = document.getElementById('waterBtn');
  const waterCounter = document.getElementById('waterCounter');
  const step2Control = document.getElementById('step2Control');

  const skyElements = document.getElementById('skyElements');
  const sunWrapper = document.getElementById('sunWrapper');
  const step3Control = document.getElementById('step3Control');
  const sunPosSlider = document.getElementById('sunPosSlider');
  const growMoreBtn = document.getElementById('growMoreBtn');

  const diarySection = document.getElementById('diarySection');
  const diaryForm = document.getElementById('diaryForm');
  const diaryAuthor = document.getElementById('diaryAuthor');
  const diaryContent = document.getElementById('diaryContent');
  const diaryParchmentCard = document.getElementById('diaryParchmentCard');
  const parchmentContent = document.getElementById('parchmentContent');
  const parchmentAuthor = document.getElementById('parchmentAuthor');
  const parchmentDate = document.getElementById('parchmentDate');
  const step4Reset = document.getElementById('step4Reset');
  const restartBtn = document.getElementById('restartBtn');
  const butterfliesLayer = document.getElementById('butterfliesLayer');
  const particlesContainer = document.getElementById('particlesContainer');

  // 배경 꽃가루 부유 파티클 생성
  createBackgroundParticles();

  // 초기 상태 설정
  updateStepUI(1);

  // =========================================================================
  // 1단계: 씨앗 심기 (드래그 앤 드롭 & 터치 지원)
  // =========================================================================

  // HTML5 Drag & Drop (데스크톱 마우스)
  draggableSeed.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', 'bean-seed');
    draggableSeed.style.opacity = '0.5';
  });

  draggableSeed.addEventListener('dragend', () => {
    draggableSeed.style.opacity = '1';
  });

  soilDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    soilMound.classList.add('drag-over');
  });

  soilDropZone.addEventListener('dragleave', () => {
    soilMound.classList.remove('drag-over');
  });

  soilDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    soilMound.classList.remove('drag-over');
    if (state.currentStep === 1) {
      plantSeedSuccess();
    }
  });

  // 모바일 & 터치 드래그 지원
  let touchStartX = 0;
  let touchStartY = 0;
  let currentTouchX = 0;
  let currentTouchY = 0;
  let isTouchingSeed = false;

  draggableSeed.addEventListener('touchstart', (e) => {
    if (state.currentStep !== 1) return;
    isTouchingSeed = true;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    draggableSeed.style.transition = 'none';
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (!isTouchingSeed) return;
    const touch = e.touches[0];
    currentTouchX = touch.clientX;
    currentTouchY = touch.clientY;
    const deltaX = currentTouchX - touchStartX;
    const deltaY = currentTouchY - touchStartY;
    draggableSeed.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.1)`;

    // 흙 영역과 겹치는지 체크
    const soilRect = soilMound.getBoundingClientRect();
    if (
      currentTouchX >= soilRect.left &&
      currentTouchX <= soilRect.right &&
      currentTouchY >= soilRect.top &&
      currentTouchY <= soilRect.bottom
    ) {
      soilMound.classList.add('drag-over');
    } else {
      soilMound.classList.remove('drag-over');
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    if (!isTouchingSeed) return;
    isTouchingSeed = false;
    soilMound.classList.remove('drag-over');
    const soilRect = soilMound.getBoundingClientRect();

    if (
      currentTouchX >= soilRect.left &&
      currentTouchX <= soilRect.right &&
      currentTouchY >= soilRect.top &&
      currentTouchY <= soilRect.bottom
    ) {
      plantSeedSuccess();
    } else {
      // 제자리로 복귀 애니메이션
      draggableSeed.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
      draggableSeed.style.transform = '';
    }
  });

  // 클릭만으로도 심을 수 있는 직관적 폴백 (유치원/초등 저학년 지원)
  draggableSeed.addEventListener('click', () => {
    if (state.currentStep === 1) {
      plantSeedSuccess();
    }
  });

  function plantSeedSuccess() {
    // 씨앗 바구니 페이드아웃
    seedShelf.classList.add('fade-out');
    soilDropIndicator.classList.add('hidden');

    // 흙 속 씨앗 애니메이션
    plantedSeedGroup.style.opacity = '1';
    plantedSeedGroup.style.transform = 'scale(1.2)';
    setTimeout(() => {
      plantedSeedGroup.style.transform = 'scale(1)';
    }, 400);

    // 흙 먼지 파티클
    createSoilPuff();

    // 1단계 성공 메시지 반영
    updateStatusMessage('“씨앗이 포근한 흙 속에서 잠들었어요.”');

    // 1.5초 후 2단계로 부드럽게 전이
    setTimeout(() => {
      goToStep(2);
    }, 1400);
  }

  // =========================================================================
  // 2단계: 물 주기와 발아
  // =========================================================================

  waterBtn.addEventListener('click', () => {
    if (state.currentStep !== 2 || state.waterCount >= state.maxWater) return;

    state.waterCount++;
    waterCounter.textContent = `${state.waterCount} / ${state.maxWater}`;

    // 수채화 물방울 번짐 효과 연출
    spawnWaterDroplets();

    if (state.waterCount === 1) {
      updateStatusMessage('촉촉한 물방울이 흙 속으로 스며들고 있어요. <em>(2번 더 주기)</em>');
    } else if (state.waterCount === 2) {
      updateStatusMessage('씨앗이 물을 머금고 꿈틀거려요! <em>(1번 더 주기)</em>');
    } else if (state.waterCount === 3) {
      // 3번 클릭: 발아 성공
      triggerSproutEmerge();
    }
  });

  function spawnWaterDroplets() {
    // 3~4개의 물방울 낙하
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const drop = document.createElement('div');
        drop.className = 'watercolor-water-drop';
        const offsetLeft = 140 + Math.random() * 120; // 화분 중심부
        drop.style.left = `${offsetLeft}px`;
        drop.style.top = '140px';
        wateringEffects.appendChild(drop);

        // 바닥 충돌 시 번지는 수채화 링
        setTimeout(() => {
          const splash = document.createElement('div');
          splash.className = 'water-splash-ring';
          splash.style.left = `${offsetLeft - 25}px`;
          splash.style.top = '340px';
          wateringEffects.appendChild(splash);

          setTimeout(() => splash.remove(), 900);
          drop.remove();
        }, 700);
      }, i * 140);
    }
  }

  function triggerSproutEmerge() {
    // 물주기 버튼 비활성화
    waterBtn.disabled = true;
    waterBtn.style.opacity = '0.7';

    setTimeout(() => {
      // 씨앗에서 연두색 싹이 쏙 올라오는 애니메이션
      sproutGroup.style.opacity = '1';
      sproutGroup.style.transform = 'translateY(15px) scale(0.4)';
      sproutGroup.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';

      setTimeout(() => {
        sproutGroup.style.transform = 'translateY(0) scale(1)';
      }, 50);

      // 2단계 성공 메시지
      updateStatusMessage('“와! 소중한 첫 싹이 기지개를 켜며 깨어났어요.”');

      // 3단계로 이동
      setTimeout(() => {
        goToStep(3);
      }, 2000);
    }, 800);
  }

  // =========================================================================
  // 3단계: 햇살과 줄기 성장 (해님 인터랙션 & 물길 흐름)
  // =========================================================================

  // 해님 마우스/터치 드래그
  sunWrapper.addEventListener('mousedown', (e) => {
    state.isDraggingSun = true;
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!state.isDraggingSun || state.currentStep < 3) return;
    handleSunMove(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
    state.isDraggingSun = false;
  });

  // 터치 지원
  sunWrapper.addEventListener('touchstart', (e) => {
    state.isDraggingSun = true;
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (!state.isDraggingSun || state.currentStep < 3) return;
    const touch = e.touches[0];
    handleSunMove(touch.clientX, touch.clientY);
  }, { passive: false });

  window.addEventListener('touchend', () => {
    state.isDraggingSun = false;
  });

  // 접근성 슬라이더 연동
  sunPosSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    applySunXPosition(val);
  });

  growMoreBtn.addEventListener('click', () => {
    if (state.stemGrowth < 100) {
      state.stemGrowth = Math.min(100, state.stemGrowth + 25);
      renderPlantGrowth();
      if (state.stemGrowth >= 100) {
        finishStage3();
      }
    }
  });

  function handleSunMove(clientX, clientY) {
    const stageRect = document.getElementById('interactiveStage').getBoundingClientRect();
    let relativeX = ((clientX - stageRect.left) / stageRect.width) * 100;
    relativeX = Math.max(15, Math.min(85, relativeX));

    applySunXPosition(relativeX);
    sunPosSlider.value = relativeX;
  }

  function applySunXPosition(percentX) {
    state.sunPosition.x = percentX;
    sunWrapper.style.left = `${percentX}%`;

    // 해님 방향으로 줄기 휘어짐 및 성장 계산
    if (state.currentStep === 3) {
      state.stemGrowth = Math.min(100, state.stemGrowth + 1.2);
      renderPlantGrowth();

      if (state.stemGrowth >= 100) {
        finishStage3();
      }
    } else if (state.currentStep === 4) {
      renderPlantGrowth();
    }
  }

  function renderPlantGrowth() {
    // 해님 위치에 따른 제어점 벤딩 (15% ~ 85% -> 120px ~ 280px)
    const bendX = 120 + (state.sunPosition.x / 100) * 160;
    
    // 성장도 (0% ~ 100% -> 높이 380에서 180까지 자람, 상단 해님과 공간 확보)
    const growthProgress = state.stemGrowth / 100;
    const topY = 380 - growthProgress * 200; 
    const midY = 410 - growthProgress * 100;

    // 본 줄기 SVG 패스 업데이트
    const stemPathData = `M 200,410 Q ${bendX},${midY} 200,${topY}`;
    mainStem.setAttribute('d', stemPathData);
    mainStemHighlight.setAttribute('d', stemPathData);
    waterSapStream.setAttribute('d', stemPathData);

    // 잎사귀 동적 렌더링
    renderLeaves(growthProgress, bendX);

    // 새싹 숨기고 메인 식물 보여주기
    sproutGroup.style.opacity = '0';
    mainPlantSystem.style.opacity = '1';
  }

  function renderLeaves(progress, bendX) {
    leavesCluster.innerHTML = '';
    const leafCount = Math.floor(progress * 6); // 최대 6개의 본잎

    for (let i = 1; i <= leafCount; i++) {
      const t = i / 7;
      const leafY = 410 - (410 - (380 - progress * 230)) * t;
      const isLeft = i % 2 !== 0;
      const leafGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      const leafX = 200 + (bendX - 200) * t;
      const angle = isLeft ? -35 - (i * 4) : 35 + (i * 4);
      const leafSize = 0.6 + t * 0.5;

      leafGroup.setAttribute('transform', `translate(${leafX}, ${leafY}) rotate(${angle}) scale(${leafSize})`);
      leafGroup.innerHTML = `
        <!-- 잎자루 및 잎사귀 -->
        <path d="M 0,0 Q ${isLeft ? -25 : 25},-10 ${isLeft ? -50 : 50},-5" fill="none" stroke="#558B2F" stroke-width="2.5" />
        <path d="M ${isLeft ? -20 : 20},-5 C ${isLeft ? -45 : 45},-30 ${isLeft ? -75 : 75},-20 ${isLeft ? -65 : 65},5 C ${isLeft ? -55 : 55},20 ${isLeft ? -30 : 30},12 ${isLeft ? -20 : 20},-5 Z"
              fill="#689F38" filter="url(#watercolor-bleed)" opacity="0.95" />
        <!-- 잎맥 -->
        <path d="M ${isLeft ? -20 : 20},-5 Q ${isLeft ? -45 : 45},-8 ${isLeft ? -60 : 60},0" fill="none" stroke="#8BC34A" stroke-width="1.2" opacity="0.8" />
      `;
      leavesCluster.appendChild(leafGroup);
    }
  }

  function finishStage3() {
    updateStatusMessage('“햇살을 듬뿍 받은 줄기가 하늘을 향해 쑥쑥 자라요.”');
    setTimeout(() => {
      goToStep(4);
    }, 1800);
  }

  // =========================================================================
  // 4단계: 개화와 일기 쓰기 (꽃, 콩 꼬투리, 나비, 일기장)
  // =========================================================================

  function triggerFloweringAndPods() {
    // 꽃봉오리와 개화한 꽃송이들 렌더링
    renderFlowers();
    flowersCluster.style.opacity = '1';
    flowersCluster.style.transition = 'opacity 1s ease';

    // 강낭콩 꼬투리 렌더링
    renderPods();
    podsCluster.style.opacity = '1';
    podsCluster.style.transition = 'opacity 1.2s ease 0.4s';

    // 나비 날아다니기 시작
    spawnButterflies();

    // 최종 메시지
    updateStatusMessage('“세상에서 가장 아름다운 꽃이 피었습니다!”');

    // 일기장 섹션 스크롤 및 표시
    diarySection.style.display = 'block';
    setTimeout(() => {
      diarySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 500);
  }

  function renderFlowers() {
    flowersCluster.innerHTML = `
      <!-- 상단 왼쪽 꽃송이 -->
      <g transform="translate(165, 175) scale(0.9)" class="flower-bloom-anim">
        <ellipse cx="-12" cy="0" rx="14" ry="10" fill="#FFF0F5" filter="url(#watercolor-bleed)" opacity="0.95" />
        <ellipse cx="12" cy="0" rx="14" ry="10" fill="#FFF0F5" filter="url(#watercolor-bleed)" opacity="0.95" />
        <ellipse cx="0" cy="-14" rx="12" ry="15" fill="#F8B4C4" filter="url(#watercolor-bleed)" opacity="0.95" />
        <ellipse cx="0" cy="8" rx="10" ry="8" fill="#F48FB1" filter="url(#watercolor-bleed)" opacity="0.9" />
        <circle cx="0" cy="0" r="4" fill="#FFE082" />
      </g>
      <!-- 상단 오른쪽 꽃송이 -->
      <g transform="translate(230, 160) scale(1)" class="flower-bloom-anim">
        <ellipse cx="-12" cy="0" rx="14" ry="10" fill="#FFF0F5" filter="url(#watercolor-bleed)" opacity="0.95" />
        <ellipse cx="12" cy="0" rx="14" ry="10" fill="#FFF0F5" filter="url(#watercolor-bleed)" opacity="0.95" />
        <ellipse cx="0" cy="-14" rx="12" ry="15" fill="#F8B4C4" filter="url(#watercolor-bleed)" opacity="0.95" />
        <ellipse cx="0" cy="8" rx="10" ry="8" fill="#F48FB1" filter="url(#watercolor-bleed)" opacity="0.9" />
        <circle cx="0" cy="0" r="4" fill="#FFE082" />
      </g>
      <!-- 중간 꽃송이 -->
      <g transform="translate(178, 230) scale(0.85)" class="flower-bloom-anim">
        <ellipse cx="-10" cy="0" rx="12" ry="8" fill="#FFF0F5" filter="url(#watercolor-bleed)" opacity="0.95" />
        <ellipse cx="10" cy="0" rx="12" ry="8" fill="#FFF0F5" filter="url(#watercolor-bleed)" opacity="0.95" />
        <ellipse cx="0" cy="-12" rx="10" ry="12" fill="#F8B4C4" filter="url(#watercolor-bleed)" opacity="0.95" />
        <circle cx="0" cy="0" r="3.5" fill="#FFE082" />
      </g>
    `;
  }

  function renderPods() {
    podsCluster.innerHTML = `
      <!-- 강낭콩 꼬투리 1 (왼쪽) -->
      <g transform="translate(155, 275) rotate(-20)">
        <path d="M 0,0 C -25,20 -35,55 -20,80 C -15,75 -8,55 0,0 Z"
              fill="#689F38" filter="url(#watercolor-bleed)" opacity="0.9" />
        <!-- 통통한 콩 볼륨감 -->
        <circle cx="-16" cy="30" r="4" fill="#8BC34A" opacity="0.7" />
        <circle cx="-20" cy="50" r="4.5" fill="#8BC34A" opacity="0.7" />
        <circle cx="-18" cy="68" r="4" fill="#8BC34A" opacity="0.7" />
      </g>
      <!-- 강낭콩 꼬투리 2 (오른쪽) -->
      <g transform="translate(225, 255) rotate(25)">
        <path d="M 0,0 C 25,20 35,55 20,80 C 15,75 8,55 0,0 Z"
              fill="#558B2F" filter="url(#watercolor-bleed)" opacity="0.9" />
        <circle cx="16" cy="30" r="4" fill="#7CB342" opacity="0.7" />
        <circle cx="20" cy="50" r="4.5" fill="#7CB342" opacity="0.7" />
        <circle cx="18" cy="68" r="4" fill="#7CB342" opacity="0.7" />
      </g>
    `;
  }

  function spawnButterflies() {
    butterfliesLayer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const bfly = document.createElement('div');
      bfly.className = 'butterfly';
      bfly.style.top = `${60 + i * 45}px`;
      bfly.style.left = `${30 + i * 90}px`;
      bfly.style.animationDelay = `${i * 2.2}s`;
      bfly.innerHTML = `
        <div class="butterfly-wing left"></div>
        <div class="butterfly-wing right"></div>
      `;
      butterfliesLayer.appendChild(bfly);
    }
  }

  // 일기 제출 처리
  diaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const author = diaryAuthor.value.trim();
    const content = diaryContent.value.trim();

    if (!author || !content) return;

    // 날짜 포맷
    const today = new Date();
    const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일, 햇살 맑은 날`;

    parchmentDate.textContent = formattedDate;
    parchmentAuthor.textContent = author;
    parchmentContent.textContent = content;

    diaryParchmentCard.style.display = 'block';
    state.diarySaved = true;

    // 축하 파티클 효과
    celebrateWithPetals();

    // 화면 부드럽게 스크롤
    diaryParchmentCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  function celebrateWithPetals() {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const petal = document.createElement('div');
        petal.className = 'particle-speck';
        petal.style.width = `${8 + Math.random() * 8}px`;
        petal.style.height = `${8 + Math.random() * 8}px`;
        petal.style.backgroundColor = Math.random() > 0.5 ? '#F8B4C4' : '#C9E0C0';
        petal.style.left = `${Math.random() * 100}%`;
        petal.style.bottom = '0';
        particlesContainer.appendChild(petal);
        setTimeout(() => petal.remove(), 7000);
      }, i * 150);
    }
  }

  // =========================================================================
  // 단계 네비게이션 & UI 업데이트
  // =========================================================================

  function goToStep(stepNumber) {
    state.currentStep = stepNumber;
    updateStepUI(stepNumber);

    if (stepNumber === 1) {
      seedShelf.classList.remove('fade-out');
      draggableSeed.style.transform = '';
      soilDropIndicator.classList.remove('hidden');
      plantedSeedGroup.style.opacity = '0';
      sproutGroup.style.opacity = '0';
      mainPlantSystem.style.opacity = '0';
      sunWrapper.style.display = 'none';
      step2Control.style.display = 'none';
      step3Control.style.display = 'none';
      step4Reset.style.display = 'none';
      diarySection.style.display = 'none';
      butterfliesLayer.innerHTML = '';
      flowersCluster.style.opacity = '0';
      podsCluster.style.opacity = '0';
      state.waterCount = 0;
      state.stemGrowth = 0;
      waterCounter.textContent = '0 / 3';
      waterBtn.disabled = false;
      waterBtn.style.opacity = '1';
      updateStatusMessage('옆에 놓인 <em>강낭콩 씨앗</em>을 살포시 드래그해서 포근한 흙 속에 심어주세요.');
    } else if (stepNumber === 2) {
      step2Control.style.display = 'block';
      step3Control.style.display = 'none';
      sunWrapper.style.display = 'none';
      step4Reset.style.display = 'none';
      updateStatusMessage('“물 주기” 버튼을 눌러 씨앗을 깨워주세요. (0 / 3)');
    } else if (stepNumber === 3) {
      step2Control.style.display = 'none';
      step3Control.style.display = 'block';
      sunWrapper.style.display = 'block';
      step4Reset.style.display = 'none';
      updateStatusMessage('상단의 <em>황금빛 해님</em>을 마우스로 움직여 줄기에게 따뜻한 빛을 비춰주세요!');
    } else if (stepNumber === 4) {
      step2Control.style.display = 'none';
      step3Control.style.display = 'none';
      sunWrapper.style.display = 'block';
      step4Reset.style.display = 'block';
      triggerFloweringAndPods();
    }
  }

  function updateStepUI(step) {
    // 상단 진행바
    const progressPercent = ((step - 1) / 3) * 100;
    progressFill.style.width = `${progressPercent}%`;

    // 노드 상태 갱신
    stepNodes.forEach((node, index) => {
      const nodeStep = index + 1;
      node.classList.remove('active', 'completed');
      if (nodeStep < step) {
        node.classList.add('completed');
      } else if (nodeStep === step) {
        node.classList.add('active');
      }
    });
  }

  // 상단 단계 버튼 클릭으로 탐색 허용 (체험 완료한 이전 단계 복습)
  stepNodes.forEach((node, index) => {
    node.addEventListener('click', () => {
      const targetStep = index + 1;
      if (targetStep <= state.currentStep) {
        goToStep(targetStep);
      }
    });
  });

  // 처음부터 다시 키우기 리셋
  restartBtn.addEventListener('click', () => {
    if (confirm('처음 씨앗 심기부터 다시 체험해볼까요?')) {
      goToStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  function updateStatusMessage(htmlText) {
    statusMessage.style.opacity = '0';
    statusMessage.style.transform = 'translateY(-4px)';
    setTimeout(() => {
      statusMessage.innerHTML = htmlText;
      statusMessage.style.opacity = '1';
      statusMessage.style.transform = 'translateY(0)';
    }, 200);
  }

  function createSoilPuff() {
    const puff = document.createElement('div');
    puff.className = 'water-splash-ring';
    puff.style.left = '160px';
    puff.style.top = '380px';
    puff.style.background = 'radial-gradient(ellipse, rgba(122, 78, 44, 0.4) 0%, transparent 70%)';
    wateringEffects.appendChild(puff);
    setTimeout(() => puff.remove(), 700);
  }

  function createBackgroundParticles() {
    for (let i = 0; i < 15; i++) {
      const speck = document.createElement('div');
      speck.className = 'particle-speck';
      speck.style.width = `${3 + Math.random() * 5}px`;
      speck.style.height = speck.style.width;
      speck.style.left = `${Math.random() * 100}%`;
      speck.style.bottom = `${Math.random() * 20}%`;
      speck.style.backgroundColor = Math.random() > 0.5 ? '#E8C4A0' : '#C9E0C0';
      speck.style.animationDelay = `${Math.random() * 6}s`;
      speck.style.animationDuration = `${6 + Math.random() * 5}s`;
      particlesContainer.appendChild(speck);
    }
  }
});
