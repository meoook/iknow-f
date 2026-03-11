export type TypeNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
export type ErrorCorrectionLevelName = 'L' | 'M' | 'Q' | 'H'
export type ModeName = 'Numeric' | 'Alphanumeric' | 'Byte'

const QRMode = {
  MODE_NUMBER: 1 << 0,
  MODE_ALPHA_NUM: 1 << 1,
  MODE_8BIT_BYTE: 1 << 2,
  MODE_KANJI: 1 << 3,
}

const QRErrorCorrectionLevel = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
}

const QRMaskPattern = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7,
}

const PAD0 = 0xec
const PAD1 = 0x11

class QrCode {
  private _typeNumber: TypeNumber
  private _errorCorrectionLevel: number
  private _modules: (boolean | null)[][] | null = null
  private _moduleCount = 0
  private _dataCache: number[] | null = null
  private _dataList: any[] = []

  constructor(typeNumber: TypeNumber, errorCorrectionLevel: ErrorCorrectionLevelName) {
    this._typeNumber = typeNumber
    this._errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel]
  }

  private setModules = () => {
    this._modules = new Array(this._moduleCount)
    for (let row = 0; row < this._moduleCount; row += 1) {
      this._modules[row] = new Array(this._moduleCount)
      for (let col = 0; col < this._moduleCount; col += 1) {
        this._modules[row][col] = null
      }
    }
  }

  private makeImpl(test: boolean, maskPattern: number) {
    this._moduleCount = this._typeNumber * 4 + 17
    this.setModules()

    this.setupPositionProbePattern(0, 0)
    this.setupPositionProbePattern(this._moduleCount - 7, 0)
    this.setupPositionProbePattern(0, this._moduleCount - 7)
    this.setupPositionAdjustPattern()
    this.setupTimingPattern()
    this.setupTypeInfo(test, maskPattern)

    if (this._typeNumber >= 7) {
      this.setupTypeNumber(test)
    }

    if (this._dataCache == null) {
      this._dataCache = this.createData(this._typeNumber, this._errorCorrectionLevel, this._dataList)
    }

    this.mapData(this._dataCache, maskPattern)
  }

  private setupPositionProbePattern(row: number, col: number) {
    for (let r = -1; r <= 7; r += 1) {
      if (row + r <= -1 || this._moduleCount <= row + r) continue
      for (let c = -1; c <= 7; c += 1) {
        if (col + c <= -1 || this._moduleCount <= col + c) continue
        if (
          (0 <= r && r <= 6 && (c == 0 || c == 6)) ||
          (0 <= c && c <= 6 && (r == 0 || r == 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this._modules![row + r][col + c] = true
        } else {
          this._modules![row + r][col + c] = false
        }
      }
    }
  }

  private getBestMaskPattern() {
    let minLostPoint = 0
    let pattern = 0
    for (let i = 0; i < 8; i += 1) {
      this.makeImpl(true, i)
      const lostPoint = QRUtil.getLostPoint(this)
      if (i == 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint
        pattern = i
      }
    }
    return pattern
  }

  private setupTimingPattern() {
    for (let r = 8; r < this._moduleCount - 8; r += 1) {
      if (this._modules![r][6] != null) continue
      this._modules![r][6] = r % 2 == 0
    }
    for (let c = 8; c < this._moduleCount - 8; c += 1) {
      if (this._modules![6][c] != null) continue
      this._modules![6][c] = c % 2 == 0
    }
  }

  private setupPositionAdjustPattern() {
    const pos = QRUtil.getPatternPosition(this._typeNumber)
    for (let i = 0; i < pos.length; i += 1) {
      for (let j = 0; j < pos.length; j += 1) {
        const row = pos[i]
        const col = pos[j]
        if (this._modules![row][col] != null) continue
        for (let r = -2; r <= 2; r += 1) {
          for (let c = -2; c <= 2; c += 1) {
            if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
              this._modules![row + r][col + c] = true
            } else {
              this._modules![row + r][col + c] = false
            }
          }
        }
      }
    }
  }

  private setupTypeNumber(test: boolean) {
    const bits = QRUtil.getBCHTypeNumber(this._typeNumber)
    for (let i = 0; i < 18; i += 1) {
      const mod = !test && ((bits >> i) & 1) == 1
      this._modules![Math.floor(i / 3)][(i % 3) + this._moduleCount - 8 - 3] = mod
    }
    for (let i = 0; i < 18; i += 1) {
      const mod = !test && ((bits >> i) & 1) == 1
      this._modules![(i % 3) + this._moduleCount - 8 - 3][Math.floor(i / 3)] = mod
    }
  }

  private setupTypeInfo(test: boolean, maskPattern: number) {
    const data = (this._errorCorrectionLevel << 3) | maskPattern
    const bits = QRUtil.getBCHTypeInfo(data)
    for (let i = 0; i < 15; i += 1) {
      const mod = !test && ((bits >> i) & 1) == 1
      if (i < 6) {
        this._modules![i][8] = mod
      } else if (i < 8) {
        this._modules![i + 1][8] = mod
      } else {
        this._modules![this._moduleCount - 15 + i][8] = mod
      }
    }
    for (let i = 0; i < 15; i += 1) {
      const mod = !test && ((bits >> i) & 1) == 1
      if (i < 8) {
        this._modules![8][this._moduleCount - i - 1] = mod
      } else if (i < 9) {
        this._modules![8][15 - i - 1 + 1] = mod
      } else {
        this._modules![8][15 - i - 1] = mod
      }
    }
    this._modules![this._moduleCount - 8][8] = !test
  }

  private mapData(data: number[], maskPattern: number) {
    let inc = -1
    let row = this._moduleCount - 1
    let bitIndex = 7
    let byteIndex = 0
    const maskFunc = QRUtil.getMaskFunction(maskPattern)
    for (let col = this._moduleCount - 1; col > 0; col -= 2) {
      if (col == 6) col -= 1
      while (true) {
        for (let c = 0; c < 2; c += 1) {
          if (this._modules![row][col - c] == null) {
            let dark = false
            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) == 1
            }
            if (maskFunc(row, col - c)) {
              dark = !dark
            }
            this._modules![row][col - c] = dark
            bitIndex -= 1
            if (bitIndex == -1) {
              byteIndex += 1
              bitIndex = 7
            }
          }
        }
        row += inc
        if (row < 0 || this._moduleCount <= row) {
          row -= inc
          inc = -inc
          break
        }
      }
    }
  }

  private createBytes(buffer: any, rsBlocks: any[]) {
    let offset = 0
    let maxDcCount = 0
    let maxEcCount = 0
    const dcdata = new Array(rsBlocks.length)
    const ecdata = new Array(rsBlocks.length)

    for (let r = 0; r < rsBlocks.length; r += 1) {
      const dcCount = rsBlocks[r].dataCount
      const ecCount = rsBlocks[r].totalCount - dcCount
      maxDcCount = Math.max(maxDcCount, dcCount)
      maxEcCount = Math.max(maxEcCount, ecCount)
      dcdata[r] = new Array(dcCount)
      for (let i = 0; i < dcdata[r].length; i += 1) {
        dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset]
      }
      offset += dcCount
      const rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount)
      const rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1)
      const modPoly = rawPoly.mod(rsPoly)
      ecdata[r] = new Array(rsPoly.getLength() - 1)
      for (let i = 0; i < ecdata[r].length; i += 1) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length
        ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0
      }
    }
    let totalCodeCount = 0
    for (let i = 0; i < rsBlocks.length; i += 1) {
      totalCodeCount += rsBlocks[i].totalCount
    }
    const data = new Array(totalCodeCount)
    let index = 0
    for (let i = 0; i < maxDcCount; i += 1) {
      for (let r = 0; r < rsBlocks.length; r += 1) {
        if (i < dcdata[r].length) {
          data[index] = dcdata[r][i]
          index += 1
        }
      }
    }
    for (let i = 0; i < maxEcCount; i += 1) {
      for (let r = 0; r < rsBlocks.length; r += 1) {
        if (i < ecdata[r].length) {
          data[index] = ecdata[r][i]
          index += 1
        }
      }
    }
    return data
  }

  private createData(typeNumber: number, errorCorrectionLevel: number, dataList: any[]) {
    const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel)
    const buffer = new QrBitBuffer()
    for (let i = 0; i < dataList.length; i += 1) {
      const data = dataList[i]
      buffer.put(data.getMode(), 4)
      buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber))
      data.write(buffer)
    }
    let totalDataCount = 0
    for (let i = 0; i < rsBlocks.length; i += 1) {
      totalDataCount += rsBlocks[i].dataCount
    }
    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error('code length overflow. (' + buffer.getLengthInBits() + '>' + totalDataCount * 8 + ')')
    }
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4)
    }
    while (buffer.getLengthInBits() % 8 != 0) {
      buffer.putBit(false)
    }
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) break
      buffer.put(PAD0, 8)
      if (buffer.getLengthInBits() >= totalDataCount * 8) break
      buffer.put(PAD1, 8)
    }
    return this.createBytes(buffer, rsBlocks)
  }

  addData(data: string) {
    const newData = new Qr8BitByte(data)
    this._dataList.push(newData)
    this._dataCache = null
  }

  isDark(row: number, col: number) {
    if (row < 0 || this._moduleCount <= row || col < 0 || this._moduleCount <= col) {
      throw new Error(row + ',' + col)
    }
    return this._modules![row][col] || false
  }

  getModuleCount = () => this._moduleCount

  make() {
    if (this._typeNumber < 1) {
      let typeNumber = 1
      for (; typeNumber < 40; typeNumber++) {
        const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this._errorCorrectionLevel)
        const buffer = new QrBitBuffer()
        for (let i = 0; i < this._dataList.length; i++) {
          const data = this._dataList[i]
          buffer.put(data.getMode(), 4)
          buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber))
          data.write(buffer)
        }
        let totalDataCount = 0
        for (let i = 0; i < rsBlocks.length; i++) {
          totalDataCount += rsBlocks[i].dataCount
        }
        if (buffer.getLengthInBits() <= totalDataCount * 8) break
      }
      this._typeNumber = typeNumber as TypeNumber
    }
    this.makeImpl(false, this.getBestMaskPattern())
  }
}

const QRUtil = (() => {
  const PATTERN_POSITION_TABLE = [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170],
  ]
  const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0)
  const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0)
  const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1)

  const _this: any = {}
  const getBCHDigit = (data: number) => {
    let digit = 0
    while (data != 0) {
      digit += 1
      data >>>= 1
    }
    return digit
  }

  _this.getBCHTypeInfo = (data: number) => {
    let d = data << 10
    while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
      d ^= G15 << (getBCHDigit(d) - getBCHDigit(G15))
    }
    return ((data << 10) | d) ^ G15_MASK
  }

  _this.getBCHTypeNumber = (data: number) => {
    let d = data << 12
    while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
      d ^= G18 << (getBCHDigit(d) - getBCHDigit(G18))
    }
    return (data << 12) | d
  }

  _this.getPatternPosition = (typeNumber: number) => PATTERN_POSITION_TABLE[typeNumber - 1]

  _this.getMaskFunction = (maskPattern: number) => {
    switch (maskPattern) {
      case QRMaskPattern.PATTERN000:
        return (i: number, j: number) => (i + j) % 2 == 0
      case QRMaskPattern.PATTERN001:
        return (i: number, _j: number) => i % 2 == 0
      case QRMaskPattern.PATTERN010:
        return (_i: number, j: number) => j % 3 == 0
      case QRMaskPattern.PATTERN011:
        return (i: number, j: number) => (i + j) % 3 == 0
      case QRMaskPattern.PATTERN100:
        return (i: number, j: number) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0
      case QRMaskPattern.PATTERN101:
        return (i: number, j: number) => ((i * j) % 2) + ((i * j) % 3) == 0
      case QRMaskPattern.PATTERN110:
        return (i: number, j: number) => (((i * j) % 2) + ((i * j) % 3)) % 2 == 0
      case QRMaskPattern.PATTERN111:
        return (i: number, j: number) => (((i * j) % 3) + ((i + j) % 2)) % 2 == 0
      default:
        throw new Error('bad maskPattern:' + maskPattern)
    }
  }

  _this.getErrorCorrectPolynomial = (errorCorrectLength: number) => {
    let a = qrPolynomial([1], 0)
    for (let i = 0; i < errorCorrectLength; i += 1) {
      a = a.multiply(qrPolynomial([1, QrMath.gexp(i)], 0))
    }
    return a
  }

  _this.getLengthInBits = (mode: number, type: number) => {
    if (1 <= type && type < 10) {
      switch (mode) {
        case QRMode.MODE_NUMBER:
          return 10
        case QRMode.MODE_ALPHA_NUM:
          return 9
        case QRMode.MODE_8BIT_BYTE:
          return 8
        case QRMode.MODE_KANJI:
          return 8
        default:
          throw new Error('mode:' + mode)
      }
    } else if (type < 27) {
      switch (mode) {
        case QRMode.MODE_NUMBER:
          return 12
        case QRMode.MODE_ALPHA_NUM:
          return 11
        case QRMode.MODE_8BIT_BYTE:
          return 16
        case QRMode.MODE_KANJI:
          return 10
        default:
          throw new Error('mode:' + mode)
      }
    } else if (type < 41) {
      switch (mode) {
        case QRMode.MODE_NUMBER:
          return 14
        case QRMode.MODE_ALPHA_NUM:
          return 13
        case QRMode.MODE_8BIT_BYTE:
          return 16
        case QRMode.MODE_KANJI:
          return 12
        default:
          throw new Error('mode:' + mode)
      }
    } else throw new Error('type:' + type)
  }

  _this.getLostPoint = (qrcode: any) => {
    const moduleCount = qrcode.getModuleCount()
    let lostPoint = 0
    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount; col += 1) {
        let sameCount = 0
        const dark = qrcode.isDark(row, col)
        for (let r = -1; r <= 1; r += 1) {
          if (row + r < 0 || moduleCount <= row + r) continue
          for (let c = -1; c <= 1; c += 1) {
            if (col + c < 0 || moduleCount <= col + c) continue
            if (r == 0 && c == 0) continue
            if (dark == qrcode.isDark(row + r, col + c)) sameCount += 1
          }
        }
        if (sameCount > 5) lostPoint += 3 + sameCount - 5
      }
    }
    for (let row = 0; row < moduleCount - 1; row += 1) {
      for (let col = 0; col < moduleCount - 1; col += 1) {
        let count = 0
        if (qrcode.isDark(row, col)) count += 1
        if (qrcode.isDark(row + 1, col)) count += 1
        if (qrcode.isDark(row, col + 1)) count += 1
        if (qrcode.isDark(row + 1, col + 1)) count += 1
        if (count == 0 || count == 4) lostPoint += 3
      }
    }
    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount - 6; col += 1) {
        if (
          qrcode.isDark(row, col) &&
          !qrcode.isDark(row, col + 1) &&
          qrcode.isDark(row, col + 2) &&
          qrcode.isDark(row, col + 3) &&
          qrcode.isDark(row, col + 4) &&
          !qrcode.isDark(row, col + 5) &&
          qrcode.isDark(row, col + 6)
        )
          lostPoint += 40
      }
    }
    for (let col = 0; col < moduleCount; col += 1) {
      for (let row = 0; row < moduleCount - 6; row += 1) {
        if (
          qrcode.isDark(row, col) &&
          !qrcode.isDark(row + 1, col) &&
          qrcode.isDark(row + 2, col) &&
          qrcode.isDark(row + 3, col) &&
          qrcode.isDark(row + 4, col) &&
          !qrcode.isDark(row + 5, col) &&
          qrcode.isDark(row + 6, col)
        )
          lostPoint += 40
      }
    }
    let darkCount = 0
    for (let col = 0; col < moduleCount; col += 1) {
      for (let row = 0; row < moduleCount; row += 1) {
        if (qrcode.isDark(row, col)) darkCount += 1
      }
    }
    const ratio = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5
    lostPoint += ratio * 10
    return lostPoint
  }
  return _this
})()

class QrMath {
  static EXP_TABLE = new Uint8Array(512)
  static LOG_TABLE = new Uint8Array(256)

  static {
    const EXP = QrMath.EXP_TABLE
    const LOG = QrMath.LOG_TABLE
    for (let i = 0; i < 8; i++) EXP[i] = 1 << i
    for (let i = 8; i < 256; i++) EXP[i] = EXP[i - 4] ^ EXP[i - 5] ^ EXP[i - 6] ^ EXP[i - 8]
    for (let i = 0; i < 255; i++) LOG[EXP[i]] = i
    for (let i = 256; i < 512; i++) EXP[i] = EXP[i - 255]
  }

  static glog(n: number) {
    if (n <= 0) throw new Error(`glog(${n})`)
    return QrMath.LOG_TABLE[n]
  }

  static gexp(n: number) {
    return QrMath.EXP_TABLE[n]
  }
}

function qrPolynomial(num: number[], shift: number) {
  const _num = (() => {
    let offset = 0
    while (offset < num.length && num[offset] == 0) offset += 1
    const res = new Array(num.length - offset + shift)
    for (let i = 0; i < num.length - offset; i += 1) res[i] = num[i + offset]
    for (let i = num.length - offset; i < res.length; i++) res[i] = 0
    return res
  })()
  const _this: any = {}
  _this.getAt = (index: number) => _num[index]
  _this.getLength = () => _num.length
  _this.multiply = (e: any) => {
    const res = new Array(_this.getLength() + e.getLength() - 1)
    for (let i = 0; i < res.length; i++) res[i] = 0
    for (let i = 0; i < _this.getLength(); i += 1) {
      for (let j = 0; j < e.getLength(); j += 1) {
        res[i + j] ^= QrMath.gexp(QrMath.glog(_this.getAt(i)) + QrMath.glog(e.getAt(j)))
      }
    }
    return qrPolynomial(res, 0)
  }
  _this.mod = (e: any) => {
    if (_this.getLength() - e.getLength() < 0) return _this
    const ratio = QrMath.glog(_this.getAt(0)) - QrMath.glog(e.getAt(0))
    const res = new Array(_this.getLength())
    for (let i = 0; i < _this.getLength(); i += 1) res[i] = _this.getAt(i)
    for (let i = 0; i < e.getLength(); i += 1) res[i] ^= QrMath.gexp(QrMath.glog(e.getAt(i)) + ratio)
    return qrPolynomial(res, 0).mod(e)
  }
  return _this
}

class QRPolynomial {
  num: Uint8Array

  constructor(num: Uint8Array, shift = 0) {
    let offset = 0
    const len = num.length

    while (offset < len && num[offset] === 0) offset++

    const newLen = len - offset + shift
    const res = new Uint8Array(newLen)

    for (let i = 0; i < len - offset; i++) {
      res[i] = num[i + offset]
    }

    this.num = res
  }

  getAt(index: number) {
    return this.num[index]
  }

  getLength() {
    return this.num.length
  }

  multiply(e: QRPolynomial) {
    const a = this.num
    const b = e.num

    const alen = a.length
    const blen = b.length

    const result = new Uint8Array(alen + blen - 1)

    const EXP = QrMath.EXP_TABLE
    const LOG = QrMath.LOG_TABLE

    for (let i = 0; i < alen; i++) {
      const ai = a[i]
      if (ai === 0) continue

      const logAi = LOG[ai]

      for (let j = 0; j < blen; j++) {
        const bj = b[j]
        if (bj === 0) continue

        result[i + j] ^= EXP[logAi + LOG[bj]]
      }
    }

    return new QRPolynomial(result)
  }

  mod(e: QRPolynomial): QRPolynomial {
    let result = this.num.slice()

    const EXP = QrMath.EXP_TABLE
    const LOG = QrMath.LOG_TABLE

    while (result.length >= e.num.length) {
      const ratio = LOG[result[0]] - LOG[e.num[0]]

      for (let i = 0; i < e.num.length; i++) {
        result[i] ^= EXP[LOG[e.num[i]] + ratio]
      }

      // remove leading zeros
      let offset = 0
      while (offset < result.length && result[offset] === 0) offset++

      result = result.slice(offset)
    }

    return new QRPolynomial(result)
  }
}

const QRRSBlock = (() => {
  const RS_BLOCK_TABLE = [
    [1, 26, 19],
    [1, 26, 16],
    [1, 26, 13],
    [1, 26, 9],
    [1, 44, 34],
    [1, 44, 28],
    [1, 44, 22],
    [1, 44, 16],
    [1, 70, 55],
    [1, 70, 44],
    [2, 35, 17],
    [2, 35, 13],
    [1, 100, 80],
    [2, 50, 32],
    [2, 50, 24],
    [4, 25, 9],
    [1, 134, 108],
    [2, 67, 43],
    [2, 33, 15, 2, 34, 16],
    [2, 33, 11, 2, 34, 12],
    [2, 86, 68],
    [4, 43, 27],
    [4, 43, 19],
    [4, 43, 15],
    [2, 98, 78],
    [4, 49, 31],
    [2, 32, 14, 4, 33, 15],
    [4, 39, 13, 1, 40, 14],
    [2, 121, 97],
    [2, 60, 38, 2, 61, 39],
    [4, 40, 18, 2, 41, 19],
    [4, 40, 14, 2, 41, 15],
    [2, 146, 116],
    [3, 58, 36, 2, 59, 37],
    [4, 36, 16, 4, 37, 17],
    [4, 36, 12, 4, 37, 13],
    [2, 86, 68, 2, 87, 69],
    [4, 69, 43, 1, 70, 44],
    [6, 43, 19, 2, 44, 20],
    [6, 43, 15, 2, 44, 16],
    [4, 101, 81],
    [1, 80, 50, 4, 81, 51],
    [4, 50, 22, 4, 51, 23],
    [3, 36, 12, 8, 37, 13],
    [2, 116, 92, 2, 117, 93],
    [6, 58, 36, 2, 59, 37],
    [4, 46, 20, 6, 47, 21],
    [7, 42, 14, 4, 43, 15],
    [4, 133, 107],
    [8, 59, 37, 1, 60, 38],
    [8, 44, 20, 4, 45, 21],
    [12, 33, 11, 4, 34, 12],
    [3, 145, 115, 1, 146, 116],
    [4, 64, 40, 5, 65, 41],
    [11, 36, 16, 5, 37, 17],
    [11, 36, 12, 5, 37, 13],
    [5, 109, 87, 1, 110, 88],
    [5, 65, 41, 5, 66, 42],
    [5, 54, 24, 7, 55, 25],
    [11, 36, 12, 7, 37, 13],
    [5, 122, 98, 1, 123, 99],
    [7, 73, 45, 3, 74, 46],
    [15, 43, 19, 2, 44, 20],
    [3, 45, 15, 13, 46, 16],
    [1, 135, 107, 5, 136, 108],
    [10, 74, 46, 1, 75, 47],
    [1, 50, 22, 15, 51, 23],
    [2, 42, 14, 17, 43, 15],
    [5, 150, 120, 1, 151, 121],
    [9, 69, 43, 4, 70, 44],
    [17, 50, 22, 1, 51, 23],
    [2, 42, 14, 19, 43, 15],
    [3, 141, 113, 4, 142, 114],
    [3, 70, 44, 11, 71, 45],
    [17, 47, 21, 4, 48, 22],
    [9, 39, 13, 16, 40, 14],
    [3, 135, 107, 5, 136, 108],
    [3, 67, 41, 13, 68, 42],
    [15, 54, 24, 5, 55, 25],
    [15, 43, 15, 10, 44, 16],
    [4, 144, 116, 4, 145, 117],
    [17, 68, 42],
    [17, 50, 22, 6, 51, 23],
    [19, 46, 16, 6, 47, 17],
    [2, 139, 111, 7, 140, 112],
    [17, 74, 46],
    [7, 54, 24, 16, 55, 25],
    [34, 37, 13],
    [4, 151, 121, 5, 152, 122],
    [4, 75, 47, 14, 76, 48],
    [11, 54, 24, 14, 55, 25],
    [16, 45, 15, 14, 46, 16],
    [6, 147, 117, 4, 148, 118],
    [6, 73, 45, 14, 74, 46],
    [11, 54, 24, 16, 55, 25],
    [30, 46, 16, 2, 47, 17],
    [8, 132, 106, 4, 133, 107],
    [8, 75, 47, 13, 76, 48],
    [7, 54, 24, 22, 55, 25],
    [22, 45, 15, 13, 46, 16],
    [10, 142, 114, 2, 143, 115],
    [19, 74, 46, 4, 75, 47],
    [28, 50, 22, 6, 51, 23],
    [33, 46, 16, 4, 47, 17],
    [8, 152, 122, 4, 153, 123],
    [22, 73, 45, 3, 74, 46],
    [8, 53, 23, 26, 54, 24],
    [12, 45, 15, 28, 46, 16],
    [3, 147, 117, 10, 148, 118],
    [3, 73, 45, 23, 74, 46],
    [4, 54, 24, 31, 55, 25],
    [11, 45, 15, 31, 46, 16],
    [7, 146, 116, 7, 147, 117],
    [21, 73, 45, 7, 74, 46],
    [1, 53, 23, 37, 54, 24],
    [19, 45, 15, 26, 46, 16],
    [5, 145, 115, 10, 146, 116],
    [19, 75, 47, 10, 76, 48],
    [15, 54, 24, 25, 55, 25],
    [23, 45, 15, 25, 46, 16],
    [13, 145, 115, 3, 146, 116],
    [2, 74, 46, 29, 75, 47],
    [42, 54, 24, 1, 55, 25],
    [23, 45, 15, 28, 46, 16],
    [17, 145, 115],
    [10, 74, 46, 23, 75, 47],
    [10, 54, 24, 35, 55, 25],
    [19, 45, 15, 35, 46, 16],
    [17, 145, 115, 1, 146, 116],
    [14, 74, 46, 21, 75, 47],
    [29, 54, 24, 19, 55, 25],
    [11, 45, 15, 46, 46, 16],
    [13, 145, 115, 6, 146, 116],
    [14, 74, 46, 23, 75, 47],
    [44, 54, 24, 7, 55, 25],
    [59, 46, 16, 1, 47, 17],
    [12, 151, 121, 7, 152, 122],
    [12, 75, 47, 26, 76, 48],
    [39, 54, 24, 14, 55, 25],
    [22, 45, 15, 41, 46, 16],
    [6, 151, 121, 14, 152, 122],
    [6, 75, 47, 34, 76, 48],
    [46, 54, 24, 10, 55, 25],
    [2, 45, 15, 64, 46, 16],
    [17, 152, 122, 4, 153, 123],
    [29, 74, 46, 14, 75, 47],
    [49, 54, 24, 10, 55, 25],
    [24, 45, 15, 46, 46, 16],
    [4, 152, 122, 18, 153, 123],
    [13, 74, 46, 32, 75, 47],
    [48, 54, 24, 14, 55, 25],
    [42, 45, 15, 32, 46, 16],
    [20, 147, 117, 4, 148, 118],
    [40, 75, 47, 7, 76, 48],
    [43, 54, 24, 22, 55, 25],
    [10, 45, 15, 67, 46, 16],
    [19, 148, 118, 6, 149, 119],
    [18, 75, 47, 31, 76, 48],
    [34, 54, 24, 34, 55, 25],
    [20, 45, 15, 61, 46, 16],
  ]
  const _this: any = {}
  _this.getRSBlocks = (typeNumber: number, errorCorrectionLevel: number) => {
    const rsBlock = RS_BLOCK_TABLE[(typeNumber - 1) * 4 + [1, 0, 3, 2][errorCorrectionLevel]]
    if (!rsBlock)
      throw new Error('bad rs block @ typeNumber:' + typeNumber + '/errorCorrectionLevel:' + errorCorrectionLevel)
    const length = rsBlock.length / 3
    const list = []
    for (let i = 0; i < length; i += 1) {
      const count = rsBlock[i * 3 + 0]
      const totalCount = rsBlock[i * 3 + 1]
      const dataCount = rsBlock[i * 3 + 2]
      for (let j = 0; j < count; j += 1) list.push({ totalCount, dataCount })
    }
    return list
  }
  return _this
})()

class QrBitBuffer {
  private buffer: number[] = []
  private length = 0

  getBuffer = () => this.buffer
  getAt = (index: number) => ((this.buffer[Math.floor(index / 8)] >>> (7 - (index % 8))) & 1) == 1
  put = (num: number, length: number) => {
    for (let i = 0; i < length; i += 1) this.putBit(((num >>> (length - i - 1)) & 1) == 1)
  }
  getLengthInBits = () => this.length
  putBit = (bit: boolean) => {
    const bufIndex = Math.floor(this.length / 8)
    if (this.buffer.length <= bufIndex) this.buffer.push(0)
    if (bit) this.buffer[bufIndex] |= 0x80 >>> (this.length % 8)
    this.length += 1
  }
}

class Qr8BitByte {
  private _mode = QRMode.MODE_8BIT_BYTE
  private _bytes: Uint8Array<ArrayBuffer>

  constructor(data: string) {
    console.log('Change1')
    this._bytes = new TextEncoder().encode(data)
  }

  getMode = () => this._mode
  getLength = () => this._bytes.length
  write = (buffer: any) => {
    for (let i = 0; i < this._bytes.length; i += 1) buffer.put(this._bytes[i], 8)
  }
}

export default QrCode
