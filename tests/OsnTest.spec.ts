import 'jasmine'
import { OSN, State } from '../src/modules/osn';
import { User } from '../src/modules/User';

var osn: OSN;
var u1: User, u2: User, u3: User;



describe("OSNImplementation",function() { 
    beforeEach(function(){
        User.count = 0;
        u1 = new User();
        u2 = new User();
        u3 = new User();

        osn = new OSN();

        osn.addUser(u1);
        osn.addUsers([u2, u3]);
    })
  
    it("should initiate default values of 1 OSN", function() {
        
       
        expect(osn.users).toEqual([u1,u2,u3]);
        expect(osn.observers).toEqual([]);
        expect(osn.state).toEqual(State.IDDLE);

           
    });

    it("should add users", function(){
        
        expect(osn.users.length).toEqual(3);

    });

    it("should get 1 user by id", function(){

        expect(osn.getUser(u1.id)).toEqual(u1);
    });

    it("should updates the follower and follows table after a user follows another",function(){
        osn.follow(u1,u2);
        expect(u1.follows).toEqual([u2]);
        expect(u2.followers).toEqual([u1]);
    })

    it("should throw an exception when one of the users is not registred on the OSN [Follow]", function(){
        let notRegistredUser = new User();
        expect( function(){ osn.follow(notRegistredUser, u2); } ).toThrow(new Error("One of the specified user is not registered in the OSN")); 
    })

});