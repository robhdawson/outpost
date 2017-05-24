import Mesh from './mesh';

import { drawMesh } from './draw.js';
import { defer } from './defer.js';

const NUMBER_OF_POINTS = 2096;

class Map {
  constructor({ numberOfPoints } = {}) {
    this.numberOfPoints = numberOfPoints || NUMBER_OF_POINTS;
    window.map = this;
  }

  generate() {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        this.mesh = new Mesh(this.numberOfPoints);
        this.mesh.makeIntoCoast();

        const canvas = drawMesh(this.mesh);

        const image = canvas.toDataURL();
        resolve(image);
      }, 0);
    });
  }

  generateAndRenderSteps(renderCallback, finalCallback) {
    const cb = () => {
      renderCallback(drawMesh(this.mesh).toDataURL());
    }

    defer(() => {
      this.mesh = new Mesh(this.numberOfPoints);
      cb();

      defer(() => {
        this.mesh.addRandomSlope();
        this.mesh.findSeaLevel();
        cb();

        defer(() => {
          this.mesh.addRandomCone();
          this.mesh.findSeaLevel();
          cb();

          const bumpAmount = Math.ceil(this.mesh.goodBumpAmount() / 3);

          defer(() => {
            this.mesh.addRandomBumps(bumpAmount);
            this.mesh.findSeaLevel();
            cb();

            defer(() => {
              this.mesh.addRandomBumps(bumpAmount);
              this.mesh.findSeaLevel();
              cb();

              defer(() => {
                this.mesh.addRandomBumps(bumpAmount);
                this.mesh.findSeaLevel();
                cb();

                defer(() => {
                  this.mesh.fillSinks();
                  this.mesh.findCoastline();
                  cb();

                  defer(() => {
                    this.mesh.niceErode(3);
                    this.mesh.findCoastline();
                    cb();

                    defer(() => {
                      this.mesh.niceErode(2);
                      this.mesh.findCoastline();
                      cb();

                      defer(() => {
                        this.mesh.niceErode(2);
                        this.mesh.findCoastline();
                        cb();

                        defer(() => {
                          this.mesh.smoothCoast(1);
                          this.mesh.findCoastline();

                          cb();

                          finalCallback();
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    })
  }

  draw() {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const canvas = drawMesh(this.mesh);
        const image = canvas.toDataURL();
        resolve(image);
      }, 0);
    });
  }
}

export default Map;
