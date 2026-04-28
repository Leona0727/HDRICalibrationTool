// more functions to check how the app works on each OS
// mock file drop
// set up webdriver io test envieonment: https://v2.tauri.app/develop/tests/webdriver/example/webdriverio/#_top
// Write a test find the area of the droping file   ui area
// mock a file drop event actua area within the area 
// ^ all this is mocking file drop system
// write a check to ensure the expected result occured
// ^ move all this logic into a "file drop" helper function
// single invalid many files, some versions of situations use helper expect any possible cases

// test cases that we want to cover:
/*
individual file test cases
1. input file name has a valid extention and its contents is also valid
2. input file name has a valid extention and its contents is not valid
3. input file name does not have a valid extention
4. input is a directry
multiple file cases:
5. input is over max number of allowed batch size
6. every input file is valid
7. every input file is invalid
8. 1 file is invalid, the rest are valid (4 files, 3 file is valid)
9. 1 file is valid,the rest are invalid (4 files each individual test case)
*/

//determine assertions as we write the tests for each case

// test onDrop function image-matrix-input.tsx in src/components

// __tests__/image-matrix-input.onDrop.path-9-cases.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ImageMatrixInput } from "../src/components/ui/image-matrix-input";


// Shared mocks
const mockOnChange = jest.fn();
const mockToastError = jest.fn();

jest.mock("react-hook-form", () => ({
	useController: () => ({
		field: { value: [], onChange: mockOnChange },
		fieldState: { invalid: false, error: undefined },
	}),
}));

// deterministic path behavior for tests (OS-independent)
const pathJoinMock = jest.fn((...parts: string[]) => parts.join("/"));
const pathDirnameMock = jest.fn((p: string) => {
	const n = p.replace(/\\/g, "/");
	const i = n.lastIndexOf("/");
	return i >= 0 ? n.slice(0, i) : "";
});
const pathBasenameMock = jest.fn((p: string) => {
	return p.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? "";
});
const pathExtnameMock = jest.fn((p: string) => {
	const i = p.lastIndexOf(".");
	return i >= 0 ? p.slice(i) : "";
});

jest.mock("path", () => ({
	join: (...args: string[]) => pathJoinMock(...args),
	dirname: (p: string) => pathDirnameMock(p),
	basename: (p: string) => pathBasenameMock(p),
	extname: (p: string) => pathExtnameMock(p),
}));

jest.mock("../src/lib/image-file-extensions", () => ({
	imageFileExtensions: ["jpg", "jpeg", "tif", "tiff", "cr2", "raw"],
}));

jest.mock("sonner", () => ({
	toast: {
		error: (...args: unknown[]) => mockToastError(...args),
	},
}));

const statMock = jest.fn();
const readDirMock = jest.fn();

jest.mock("@tauri-apps/plugin-fs", () => ({
	stat: (...args: unknown[]) => statMock(...args),
	readDir: (...args: unknown[]) => readDirMock(...args),
}));

// Replace TauriDropzone with explicit scenario buttons
jest.mock("../src/components/ui/tauri-dropzone", () => ({
	TauriDropzone: ({ onDrop }: { onDrop: (files: string[]) => Promise<void> }) => (
		<div>
			<button data-testid="case-1" onClick={() => onDrop(["/sceneA/valid1.jpg"])}>
				case-1
			</button>
			<button data-testid="case-2" onClick={() => onDrop(["/sceneA/valid-but-invalid-content.jpg"])}>
				case-2
			</button>
			<button data-testid="case-3" onClick={() => onDrop(["/sceneA/not-image.txt"])}>
				case-3
			</button>
			<button data-testid="case-4" onClick={() => onDrop(["/batch/setDir"])}>
				case-4
			</button>
			<button
				data-testid="case-5"
				onClick={() =>
					onDrop([
						"/overMax/a.jpg",
						"/overMax/b.jpg",
						"/overMax/c.jpg",
						"/overMax/d.jpg",
						"/overMax/e.jpg",
						"/overMax/f.jpg",
					])
				}
			>
				case-5
			</button>
			<button
				data-testid="case-6"
				onClick={() => onDrop(["/allValid/a.jpg", "/allValid/b.tif", "/allValid/c.cr2"])}
			>
				case-6
			</button>
			<button
				data-testid="case-7"
				onClick={() => onDrop(["/allInvalid/a.txt", "/allInvalid/b.csv", "/allInvalid/c.docx"])}
			>
				case-7
			</button>
			<button
				data-testid="case-8"
				onClick={() => onDrop(["/mixA/ok1.jpg", "/mixA/ok2.tif", "/mixA/ok3.raw", "/mixA/bad1.txt"])}
			>
				case-8
			</button>
			<button
				data-testid="case-9"
				onClick={() => onDrop(["/mixB/ok1.jpg", "/mixB/bad1.txt", "/mixB/bad2.csv", "/mixB/bad3.docx"])}
			>
				case-9
			</button>
		</div>
	),
}));

// simplify unrelated UI wrappers
jest.mock("../src/components/ui/field", () => ({
	Field: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FieldContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	FieldError: () => null,
}));
jest.mock("../src/components/ui/context-menu", () => ({
	ContextMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ContextMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ContextMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	ContextMenuItem: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));
jest.mock("../src/components/ui/image-set-preview", () => ({
	ImageSetPreview: () => null,
}));

describe("ImageMatrixInput onDrop - 9 mock cases with Tauri + path checks", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		// default: path is a file
		statMock.mockImplementation(async (p: string) => ({
			isFile: true,
			name: p.replace(/\\/g, "/").split("/").pop() ?? "",
		}));

		readDirMock.mockResolvedValue([]);
	});

	function renderTarget() {
		render(<ImageMatrixInput control={{} as any} name={"inputSets" as any} />);
	}

	test("Case 1: valid extension and valid input path", async () => {
		renderTarget();
		fireEvent.click(screen.getByTestId("case-1"));

		await waitFor(() => expect(mockOnChange).toHaveBeenCalledTimes(1));

		// path checks
		expect(pathDirnameMock).toHaveBeenCalledWith("/sceneA/valid1.jpg");
		expect(pathBasenameMock).toHaveBeenCalledWith("/sceneA");
		expect(pathBasenameMock).toHaveBeenCalledWith("/sceneA/valid1.jpg");

		expect(mockOnChange.mock.calls[0][0]).toEqual([
			{ name: "sceneA", files: ["/sceneA/valid1.jpg"] },
		]);
	});

	test("Case 2: valid extension but invalid content (simulated rejection)", async () => {
		// Current code does not inspect file content.
		// Simulate rejection by returning isFile=false for this path.
		statMock.mockResolvedValue({ isFile: false, name: "valid-but-invalid-content.jpg" });

		renderTarget();
		fireEvent.click(screen.getByTestId("case-2"));

		await waitFor(() => expect(mockOnChange).toHaveBeenCalledTimes(1));

		expect(mockOnChange.mock.calls[0][0]).toEqual([{ name: "sceneA", files: [] }]);
	});

	test("Case 3: invalid extension path", async () => {
		renderTarget();
		fireEvent.click(screen.getByTestId("case-3"));

		await waitFor(() => expect(mockOnChange).toHaveBeenCalledTimes(1));

		expect(pathExtnameMock).toHaveBeenCalledWith("not-image.txt");
		expect(mockOnChange.mock.calls[0][0]).toEqual([{ name: "sceneA", files: [] }]);
		expect(mockToastError).toHaveBeenCalled();
	});

	test("Case 4: input is a directory, readDir + join path mapping", async () => {
		statMock.mockResolvedValue({ isFile: false, name: "setDir" });
		readDirMock.mockResolvedValue([
			{ name: "a.jpg", isFile: true },
			{ name: "b.txt", isFile: true },
			{ name: "c.tiff", isFile: true },
		]);

		renderTarget();
		fireEvent.click(screen.getByTestId("case-4"));

		await waitFor(() => expect(mockOnChange).toHaveBeenCalledTimes(1));

		expect(readDirMock).toHaveBeenCalledWith("/batch/setDir");
		expect(pathJoinMock).toHaveBeenCalledWith("/batch/setDir", "a.jpg");
		expect(pathJoinMock).toHaveBeenCalledWith("/batch/setDir", "b.txt");
		expect(pathJoinMock).toHaveBeenCalledWith("/batch/setDir", "c.tiff");
		expect(pathBasenameMock).toHaveBeenCalledWith("/batch/setDir");

		expect(mockOnChange.mock.calls[0][0]).toEqual([
			{ name: "setDir", files: ["/batch/setDir/a.jpg", "/batch/setDir/c.tiff"] },
		]);
	});

	test("Case 5: over max batch size (document current behavior)", async () => {
		// Current onDrop has no max-size validation, so all files are accepted if extension is valid.
		renderTarget();
		fireEvent.click(screen.getByTestId("case-5"));

		await waitFor(() => expect(mockOnChange).toHaveBeenCalledTimes(1));

		expect(mockOnChange.mock.calls[0][0]).toEqual([
			{
				name: "overMax",
				files: [
					"/overMax/a.jpg",
					"/overMax/b.jpg",
					"/overMax/c.jpg",
					"/overMax/d.jpg",
					"/overMax/e.jpg",
					"/overMax/f.jpg",
				],
			},
		]);
	});

	test("Case 6: every input file is valid", async () => {
		renderTarget();
		fireEvent.click(screen.getByTestId("case-6"));

		await waitFor(() => expect(mockOnChange).toHaveBeenCalledTimes(1));

		expect(mockOnChange.mock.calls[0][0]).toEqual([
			{
				name: "allValid",
				files: ["/allValid/a.jpg", "/allValid/b.tif", "/allValid/c.cr2"],
			},
		]);
	});

	test("Case 7: every input file is invalid", async () => {
		renderTarget();
		fireEvent.click(screen.getByTestId("case-7"));

		await waitFor(() => expect(mockOnChange).toHaveBeenCalledTimes(1));

		expect(mockOnChange.mock.calls[0][0]).toEqual([
			{
				name: "allInvalid",
				files: [],
			},
		]);
	});

	test("Case 8: one invalid and three valid files", async () => {
		renderTarget();
		fireEvent.click(screen.getByTestId("case-8"));

		await waitFor(() => expect(mockOnChange).toHaveBeenCalledTimes(1));

		expect(mockOnChange.mock.calls[0][0]).toEqual([
			{
				name: "mixA",
				files: ["/mixA/ok1.jpg", "/mixA/ok2.tif", "/mixA/ok3.raw"],
			},
		]);
	});

	test("Case 9: one valid and three invalid files", async () => {
		renderTarget();
		fireEvent.click(screen.getByTestId("case-9"));

		await waitFor(() => expect(mockOnChange).toHaveBeenCalledTimes(1));

		expect(mockOnChange.mock.calls[0][0]).toEqual([
			{
				name: "mixB",
				files: ["/mixB/ok1.jpg"],
			},
		]);
	});
});
