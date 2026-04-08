import {
  validateFiles
} from "../src/lib/file-drop"


function makeFile(name, content="ok"){
  return new File([content], name, { type:"text/plain" })
}


describe("file drop unit test", () => {

  // 1
  test("valid extension + valid content", () => {
    const f = makeFile("a.cal")
    const res = validateFiles([f])
    expect(res.valid.length).toBe(1)
  })


  // 2
  test("valid extension + invalid content", () => {
    const f = makeFile("invalid.cal")
    const res = validateFiles([f])
    expect(res.valid.length).toBe(0)
  })


  // 3
  test("invalid extension", () => {
    const f = makeFile("a.txt")
    const res = validateFiles([f])
    expect(res.valid.length).toBe(0)
  })


  // 4
  test("directory", () => {
    const f = new File([], "folder")
    const res = validateFiles([f])
    expect(res.valid.length).toBe(0)
  })


  // 5
  test("batch overflow", () => {
    const files = Array.from({length:10}, (_,i)=>
      makeFile(`a${i}.cal`)
    )
    const res = validateFiles(files)
    expect(res.valid.length).toBe(0)
  })


  // 6
  test("all valid", () => {
    const files = [makeFile("a.cal"), makeFile("b.cal")]
    const res = validateFiles(files)
    expect(res.valid.length).toBe(2)
  })


  // 7
  test("all invalid", () => {
    const files = [makeFile("a.txt"), makeFile("b.txt")]
    const res = validateFiles(files)
    expect(res.valid.length).toBe(0)
  })


  // 8
  test("1 invalid 3 valid", () => {
    const files = [
      makeFile("a.cal"),
      makeFile("b.cal"),
      makeFile("c.cal"),
      makeFile("bad.txt"),
    ]
    const res = validateFiles(files)
    expect(res.valid.length).toBe(3)
  })


  // 9
  test("1 valid rest invalid", () => {
    const files = [
      makeFile("a.cal"),
      makeFile("b.txt"),
      makeFile("c.txt"),
      makeFile("d.txt"),
    ]
    const res = validateFiles(files)
    expect(res.valid.length).toBe(1)
  })

})
