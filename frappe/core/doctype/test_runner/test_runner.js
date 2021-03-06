// Copyright (c) 2017, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Test Runner', {
	refresh: (frm) => {
		frm.disable_save();
		frm.page.set_primary_action(__("Run Tests"), () => {
			return new Promise(resolve => {
				let wrapper = $(frm.fields_dict.output.wrapper).empty();
				$("<p>Loading...</p>").appendTo(wrapper);

				// all tests
				frappe.call({
					method: 'frappe.core.doctype.test_runner.test_runner.get_test_js'
				}).always((data) => {
					$("<div id='qunit'></div>").appendTo(wrapper.empty());
					frm.events.run_tests(frm, data.message);
					resolve();
				});
			});
		});

	},
	run_tests: function(frm, files) {
		let require_list = [
			"assets/frappe/js/lib/jquery/qunit.js",
			"assets/frappe/js/lib/jquery/qunit.css"
		].concat();

		frappe.require(require_list, () => {
			files.forEach((f) => {
				frappe.dom.eval(f.script);
			});

			// if(frm.doc.module_name) {
			// 	QUnit.module.only(frm.doc.module_name);
			// }

			QUnit.testDone(function(details) {
				var result = {
					"Module name": details.module,
					"Test name": details.name,
					"Assertions": {
						"Total": details.total,
						"Passed": details.passed,
						"Failed": details.failed
					},
					"Skipped": details.skipped,
					"Todo": details.todo,
					"Runtime": details.runtime
				};

				details.assertions.map(a => {
					// eslint-disable-next-line
					console.log(`${a.result ? '✔' : '✗'}  ${a.message}`);
				});

				// eslint-disable-next-line
				console.log(JSON.stringify(result, null, 2));
			});
			QUnit.load();

			QUnit.done(({ total, failed, passed, runtime }) => {
				// flag for selenium that test is done

				console.log( `Total: ${total}, Failed: ${failed}, Passed: ${passed}, Runtime: ${runtime}` );  // eslint-disable-line

				if(failed) {
					console.log('Tests Failed'); // eslint-disable-line
				} else {
					console.log('Tests Passed'); // eslint-disable-line
				}
				frappe.set_route('Form', 'Test Runner', 'Test Runner');

				$('<div id="frappe-qunit-done"></div>').appendTo($('body'));

			});
		});

	}
});
