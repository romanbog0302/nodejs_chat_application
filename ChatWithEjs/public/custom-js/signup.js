/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


nodeChat = typeof nodeChat !== "undefined" ? nodeChat : {};

nodeChat.signUp = {
    _init: function () {
        this.signupValidation();
    },
    signupValidation: function () {

        var lMe = this;
        $('#signup').validate({
            // Rules for form validation
            rules: {
                name: {
                    required: true
                },
                lname: {
                    required: true
                },
                email: {
                    required: true,
                    email: true
                },
                pwd: {
                    required: true,
                    minlength: 3,
                    maxlength: 20
                },
                conformPwd: {
                    required: true,
                    minlength: 3,
                    maxlength: 20,
                    equalTo: '#pwd'
                },
                mobile: {
                    digits: true,
                    minlength: 10
                }
            },
            // Messages for form validation
            messages: {
                name: {
                    required: 'Please enter your first name'
                },
                lname: {
                    required: 'Please enter your last name'
                },
                email: {
                    required: 'Please enter your email address',
                    email: 'Please enter a VALID email address'
                },
                pwd: {
                    required: 'Please enter your password'
                },
                conformPwd: {
                    required: 'Please enter your password one more time',
                    equalTo: 'Please enter the same password as above'
                },
                mobile: {
                    digits: "Enter only digits",
                    minlength: "Minimum 10 digits"
                }
            },
            // Ajax form submition
            submitHandler: function (form) {
                $(form).ajaxSubmit({
                    success: function () {
                        $(lMe.SEL_FORM_REGISTER).addClass('submited');
                    }
                });
            },
            // Do not change code below
            errorPlacement: function (error, element) {
                error.insertAfter(element.parent());
            }
        });
    },
}

$(document).ready(function () {
    nodeChat.signUp._init();
});