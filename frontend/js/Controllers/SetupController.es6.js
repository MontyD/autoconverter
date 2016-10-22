'use strict';

class SetupController {

    constructor(UsersService, ConfigService, ConvertersService, Notification) {
        this.UsersService = UsersService;
        this.ConfigService = ConfigService;
        this.ConvertersService = ConvertersService;
        this.Notification = Notification;

        this.sections = {


            databaseError: {
                complete: true,
            },
            user: {
                complete: false,
            },

            converter: {
                complete: false
            },

            config: {
                complete: false
            },
            done: {
                complete: false
            }
        };

        this.runTest(this.UsersService.get.bind(this.UsersService), 0, this.sections.user)
            .then(() => this.runTest(this.ConvertersService.get.bind(this.ConvertersService), 0, this.sections.converter))
            .then(() => this.runTest(this.ConfigService.runTests.bind(this.ConfigService), 'success', this.sections.config))
            .catch(this.handleErrors.bind(this));

        document.body.classList.add('loaded');
    }

    getClassName(attribute) {
        if (this.sections[attribute].complete) {
            return 'complete';
        }
        for (let key in this.sections) {
            if (this.sections.hasOwnProperty(key)) {
                if (key === attribute && !this.sections[key].complete) {
                    return 'active';
                } else if (!this.sections[key].complete) {
                    return '';
                }
            }
        }
    }

    runTest(test, dataAttribute, elementToSetComplete) {
        return new Promise((resolve, reject) => {
            test()
                .then(response => {
                    if (response.data[dataAttribute]) {
                        elementToSetComplete.complete = true;
                        return resolve();
                    }
                    return reject({
                        message: 'No users created'
                    });
                }).catch(err => reject(err));
        });

    }

    newUser(user) {
        user.isAdmin = true;
        return this.UsersService.create(user);
    }

    newConverter(converter) {
        converter.primary = true;
        return this.ConvertersService.create(converter);
    }

    setConfig(config) {
        return this.ConfigService.create(config);
    }

    success(type) {
        this.sections[type].complete = true;
        this.Notification.success(type + ' successfully created!');
    }

    handleErrors(error) {
        if (/database|relation/gi.test(error.data)) {
            this.sections.databaseError.complete = false;
        } else {
            this.sections.databaseError.complete = true;
        }
        this.Notification('Setup incomplete');
        return false;
    }

}

SetupController.$inject = ['UsersService', 'ConfigService', 'ConvertersService', 'Notification'];

export default SetupController;
