pipeline{
	agent any
	stages {
	    stage ('checkout') {
               steps {
                  echo "Checking out source code"
 		  checkout scm
                 }
             }

            stage ('Environment Info') {
               steps {
               sh 'whoami'
               sh 'pwd'
               sh 'node -v || true'
               sh 'npm -v || true'
               sh 'docker --version || true'
               sh 'docker compose version || true' 
               }
              }

            stage ('Backend Install') {
                steps {
		  dir ('apps/backend') {
		   sh 'npm ci'
		  }
		}
	     } 	
            
             stage ('Backend Syntax Check') {
                 steps {
                     dir ('apps/backend') {
                        sh 'npm run check'
                      }
                    }
		  }
             
 	    stage ('Frontend Install') {
               steps {
                   dir ('apps/frontend') {
                    sh 'npm ci'
                    }
                  }
               }
            
            stage ('Frontend Build') {
               steps {
                 dir ('apps/frontend') {
                  sh 'npm run build'
                }
               }
            } 
            
            stage ('Docker Compose Config Validation') {
                 steps {
                   sh 'docker compose config'
               }
             }      
          }

     post {
       success {
          echo "CI pipeline completed successfully"
        }
       failure {
          echo 'CI pipeline failed, check the console logs and failed stage'
        }
       always {
           echo 'CI pipeline completed'
        }
    } 
       
}
