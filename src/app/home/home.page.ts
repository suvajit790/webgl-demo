import { Component, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

@Component({
   selector: 'app-home',
   templateUrl: 'home.page.html',
   styleUrls: ['home.page.scss'],
})
export class HomePage {

   @ViewChild('renderContainer') canvasEl: ElementRef;
   private element: any;
   private scene;
   private camera;
   public renderer;
   private manager;
   private fbxLoader;
   private mixers;
   private modelAssetPath = "./assets/3D-assets/models/"
   private animAssetPath = "./assets/3D-assets/animations/"
   private model;

   private clock = new THREE.Clock();

   constructor() {
   }

   ionViewWillEnter(): void {
      console.log('load');
      this.init();
      this.animate();
   }


   init() {
      this.element = this.canvasEl.nativeElement;

      this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
      this.camera.position.set( 0, 200, 300 );

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color( 0xa0a0a0 );
      this.scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

      const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
      hemiLight.position.set( 0, 200, 0 );
      this.scene.add( hemiLight );

      const dirLight = new THREE.DirectionalLight( 0xffffff );
      dirLight.position.set( 0, 200, 100 );
      dirLight.castShadow = true;
      dirLight.shadow.camera.top = 180;
      dirLight.shadow.camera.bottom = - 100;
      dirLight.shadow.camera.left = - 120;
      dirLight.shadow.camera.right = 120;
      this.scene.add( dirLight );

      // ground
      const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
      mesh.rotation.x = - Math.PI / 2;
      mesh.receiveShadow = true;
      this.scene.add( mesh );

      const grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
      grid.material.opacity = 0.2;
      grid.material.transparent = true;
      this.scene.add( grid );

      this.manager = new THREE.LoadingManager();
      this.fbxLoader = new FBXLoader(this.manager);
      this.mixers = [];

      // model
      this.modelManager("init")
      
      // let manager = new THREE.LoadingManager();
      // const loader = new FBXLoader(manager);
      // loader.load( 'assets/3D-assets/Samba_Dancing.fbx', object => {

      //    this.mixer = new THREE.AnimationMixer( object );

      //    const action = this.mixer.clipAction( object.animations[ 0 ] );
      //    action.play();

      //    object.traverse(  child => {

      //       if ( child.isMesh ) {

      //          child.castShadow = true;
      //          child.receiveShadow = true;

      //       }

      //    } );

      //    this.scene.add( object );
      //    console.log("model")

      // } );

      this.renderer = new THREE.WebGLRenderer( { antialias: true } );
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.renderer.shadowMap.enabled = true;
      this.element.appendChild( this.renderer.domElement );

      const controls = new OrbitControls( this.camera, this.renderer.domElement );
      controls.target.set( 0, 100, 0 );
      controls.update();

   }

   public modelManager(mode) {
      let model = "ybot.fbx"
      this.loadModel(this.modelAssetPath + model)
   }

   public animManager(mode) {
      let animation = "Standing Idle.fbx"

      if (mode == "a1") {
         animation = "Button Pushing.fbx"
      } else if (mode == "a2") {
         animation = "Petting Animal.fbx"
      } else if (mode == "a3") {
         animation = "Standing Greeting.fbx"
      } else if (mode == "a4") {
         animation = "Waving Gesture.fbx"
      } else if (mode == "a5") {
         animation = "Standing Idle.fbx"
      }

      this.loadAnimation(this.animAssetPath + animation)
   }

   private loadModel(modelFile) {
      this.scene.remove(this.model)

      const loader = this.fbxLoader;
      loader.load(modelFile, (model) => {
         model.scale.setScalar(1);
         model.traverse(c => {
            c.castShadow = true;
         });

         this.model = model
         this.animManager("init")
         this.scene.add(model);
      });
   }

   private loadAnimation(animFile) {
      const anim = this.fbxLoader;
      anim.load(animFile, (anim) => {
         const mixer = new THREE.AnimationMixer(this.model);
         this.mixers.push(mixer);
         const idle = mixer.clipAction(anim.animations[0]);
         console.log("animation play")
         idle.play();
      });
   }

   private animate(): void {
      requestAnimationFrame(() => {
         this.animate();
      });

      const delta = this.clock.getDelta();

      if (this.mixers) {
         this.mixers.map(mixer => mixer.update(delta));
       }
      // console.log("animate")

      this.renderer.render( this.scene, this.camera );
   };

}
