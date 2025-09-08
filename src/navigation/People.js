/**
 * @fileOverview
 * @author yoshizawa
 */

/**
 * A People client
 *
 * @constructor
 * @param options - object with following keys:
 *
 *  * ros - the ROSLIB.Ros connection handle
 *  * topic - the marker topic to listen to
 *  * tfClient - the TF client handle to use
 *  * rootObject (optional) - the root object to add this marker to
 *  * color (optional) - color for line (default: 0xcc00ff)
 *  * radius (optional) - radius of the point (default: 0.2)
 */
ROS3D.People = function(options) {
  THREE.Object3D.call(this);
  this.options = options || {};
  this.ros = options.ros;
  this.topicName = options.topic || '/people';
	this.messageTypeName = options.messageType || 'people_msgs/msg/People';
  this.tfClient = options.tfClient;
  this.color = options.color || 0x0000ff;
  this.rootObject = options.rootObject || new THREE.Object3D();
  this.radius = options.radius || 0.2;

	this.peoples = [];

  this.rosTopic = undefined;
  this.subscribe();
};
ROS3D.People.prototype.__proto__ = THREE.Object3D.prototype;


ROS3D.People.prototype.unsubscribe = function(){
  if(this.rosTopic){
    this.rosTopic.unsubscribe(this.processMessage);
  }
};

ROS3D.People.prototype.subscribe = function(){
  this.unsubscribe();

  // subscribe to the topic
  this.rosTopic = new ROSLIB.Topic({
      ros : this.ros,
      name : this.topicName,
      queue_length : 1,
      messageType : this.messageTypeName
  });
  this.rosTopic.subscribe(this.processMessage.bind(this));
};

ROS3D.People.prototype.processMessage = function(message){
  for (let i = 0; i < this.peoples.length; i++) {
      this.rootObject.remove(this.peoples[i]);
  }

  if (message.people.length > 0) {
      this.peoples = [];
      message.people.forEach(person => {
          var sphereGeometry = new THREE.SphereGeometry( this.radius );
          var sphereMaterial = new THREE.MeshBasicMaterial( {color: this.color} );
          var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.position.set(person.position.x, person.position.y, person.position.z);

          var node = new ROS3D.SceneNode({
              frameID : message.header.frame_id,
              tfClient : this.tfClient,
              object : sphere
          });

          this.peoples.push(node);
          this.rootObject.add(node);
      });
  }
};
