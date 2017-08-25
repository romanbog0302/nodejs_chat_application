/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


nodeChat = typeof nodeChat !== "undefined" ? nodeChat : {};

nodeChat.profile = {
    _init: function () {
        this.changePwdValidation();
    },
    changePwdValidation: function () {
        
        var lMe = this;
        $('#updateProfile').validate({
            // Rules for form validation
            rules: {
                fName: {
                    required: true
                },
                lName: {
                    required: true
                },
                curentPwd: {
                    required: true,
                    minlength: 3,
                    maxlength: 20
                },
                newPwd: {
                    required: true,
                    minlength: 3,
                    maxlength: 20
                },
                cunformPwd: {
                    required: true,
                    minlength: 3,
                    maxlength: 20,
                    equalTo: '#newPwd'
                },
                mobile: {
                    digits: true,
                    minlength: 10
                }
            },
            // Messages for form validation
            messages: {
                fName: {
                    required: 'Please enter your first name'
                },
                lName: {
                    required: 'Please enter your last name'
                },
                email: {
                    required: 'Please enter your email address',
                    email: 'Please enter a VALID email address'
                },
                curentPwd: {
                    required: 'Please enter your current password'
                },
                newPwd: {
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
                        //$(lMe.SEL_FORM_REGISTER).addClass('submited');
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
    nodeChat.profile._init();
});