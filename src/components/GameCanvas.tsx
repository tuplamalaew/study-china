'use client';

import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface GameCanvasProps {
  currentLevel: string;
  floatingDamage: { id: number, text: string, type: 'normal' | 'critical' | 'damage' }[];
  questProgress: number;
  questTarget: number;
}

export default function GameCanvas({ currentLevel, floatingDamage, questProgress, questTarget }: GameCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Store props in refs to access them inside the Pixi ticker without re-binding
  const floatingDamageRef = useRef(floatingDamage);

  useEffect(() => {
    floatingDamageRef.current = floatingDamage;
  }, [floatingDamage]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create raw PixiJS application (v7 API)
    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    });
    
    // Append the canvas to the DOM
    canvasRef.current.appendChild(app.view as unknown as HTMLElement);

    // Handle Resize
    const resize = () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);

    // State for tracking rendered floating texts to animate them
    const activeEffects = new Map<number, { 
      textContainer: PIXI.Container, 
      vfxContainer: PIXI.Container, 
      sprite: PIXI.Sprite, 
      mask?: PIXI.Graphics,
      age: number, 
      type: string 
    }>();

    // Preload Textures
    const slashTexture = PIXI.Texture.from('/assets/effects/slash.png');
    const critTexture = PIXI.Texture.from('/assets/effects/crit.png');
    const damageTexture = PIXI.Texture.from('/assets/effects/damage.png');

    let shakeTimer = 0;

    // The Game Loop
    app.ticker.add((delta) => {
      // 1. Screen Shake Logic
      if (shakeTimer > 0) {
        shakeTimer -= delta;
        app.stage.x = (Math.random() - 0.5) * 30; // Shake intensity
        app.stage.y = (Math.random() - 0.5) * 30;
      } else {
        app.stage.x = 0;
        app.stage.y = 0;
      }

      const currentDamages = floatingDamageRef.current;
      
      // 2. Process incoming floating damages
      currentDamages.forEach(d => {
        if (!activeEffects.has(d.id)) {
          
          const isCritical = d.type === 'critical';
          const isDamage = d.type === 'damage';
          const isSlash = !isCritical && !isDamage;

          // --- TEXT CONTAINER (Floats up from random position) ---
          const textContainer = new PIXI.Container();
          textContainer.x = window.innerWidth / 2 + (Math.random() * 100 - 50);
          textContainer.y = window.innerHeight / 3;

          const style = new PIXI.TextStyle({
            fontFamily: ['"Ma Shan Zheng"', 'cursive'],
            fontSize: isCritical ? 64 : 48,
            fontWeight: 'bold',
            fill: isCritical ? ['#facc15', '#a16207'] : isDamage ? ['#f43f5e', '#be123c'] : ['#ffffff', '#cbd5e1'],
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
          });
          const text = new PIXI.Text(d.text, style);
          text.anchor.set(0.5);
          textContainer.addChild(text);
          app.stage.addChild(textContainer);

          // --- VFX CONTAINER (Center of screen) ---
          const vfxContainer = new PIXI.Container();
          vfxContainer.x = window.innerWidth / 2;
          vfxContainer.y = window.innerHeight / 2;
          
          const sprite = new PIXI.Sprite(isCritical ? critTexture : isDamage ? damageTexture : slashTexture);
          sprite.blendMode = PIXI.BLEND_MODES.ADD; // Neon aura effect
          
          let mask;

          if (isSlash) {
            // Normal hit: Left-to-right slash at center
            sprite.anchor.set(0, 0.5); // Anchor to left
            vfxContainer.x -= 300; // Move container left so slash starts from left and goes through center
            sprite.scale.set(0, 0.6); // Start width 0
            
            // Mask for fading from left to right
            mask = new PIXI.Graphics();
            mask.beginFill(0xffffff);
            mask.drawRect(0, -500, 1000, 1000);
            mask.endFill();
            sprite.mask = mask;
            vfxContainer.addChild(mask);
            
            shakeTimer = 8; // Trigger screen shake
          } else {
            // Crit / Damage: Center pop-in aura
            sprite.anchor.set(0.5);
            sprite.scale.set(0.1); // Start small
            sprite.alpha = 0; // Start invisible
          }
          
          vfxContainer.addChild(sprite);
          app.stage.addChild(vfxContainer);

          activeEffects.set(d.id, { textContainer, vfxContainer, sprite, mask, age: 0, type: d.type });
        }
      });

      // 3. Animate active effects
      activeEffects.forEach((effect, id) => {
        effect.age += delta;
        
        // --- Text Animation ---
        effect.textContainer.y -= 2 * delta; // Float up
        const textAlpha = Math.max(0, 1 - (effect.age * 0.02));
        effect.textContainer.alpha = textAlpha;

        // --- VFX Animation ---
        let vfxAlpha = 1;

        if (effect.type === 'normal') {
          // Slash Animation
          if (effect.age < 10) {
            // Extend slash quickly from left to right
            effect.sprite.scale.x = Math.min(0.8, effect.sprite.scale.x + 0.15 * delta);
          } else {
            // Fade out from left to right by moving mask to the right
            if (effect.mask) {
              effect.mask.x += 30 * delta; 
            }
            // Also fade out slightly
            vfxAlpha = Math.max(0, 1 - ((effect.age - 10) * 0.05));
            effect.sprite.alpha = vfxAlpha;
          }
        } else {
          // Aura Animation (Crit/Damage)
          if (effect.age < 15) {
            // Pop in
            effect.sprite.alpha = Math.min(1, effect.sprite.alpha + 0.1 * delta);
            effect.sprite.scale.set(Math.min(0.6, effect.sprite.scale.x + 0.05 * delta));
          } else {
            // Slowly fade out
            vfxAlpha = Math.max(0, 1 - ((effect.age - 15) * 0.03));
            effect.sprite.alpha = vfxAlpha;
          }
        }

        // Cleanup
        if (textAlpha <= 0 && vfxAlpha <= 0) {
          app.stage.removeChild(effect.textContainer);
          app.stage.removeChild(effect.vfxContainer);
          effect.textContainer.destroy({ children: true });
          effect.vfxContainer.destroy({ children: true });
          activeEffects.delete(id);
        }
      });
    });

    return () => {
      window.removeEventListener('resize', resize);
      app.destroy(true, { children: true });
    };
  }, []); // Only mount once

  return <div ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 mix-blend-screen overflow-hidden" />;
}
