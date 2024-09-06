---
title: 小数据压缩阈值测试
cover: false
categories: [日常随写]
tags: [测试, 压缩, 算法]
author: 咸小鱼
group: default
date: 2024-9-6
updated: 2024-9-6
comments: true
readmore: false
---

使用JMH进行压缩基准测试，评估小数据的最佳压缩阈值。

<!-- more -->


## 模拟传输JSON对象生成

使用Mock.js生成不同大小的json字符串

{% folding Mock代码实现 %}
```javascript
const Mock = require('mockjs')
const { Buffer } = require('node:buffer')
const fs = require('node:fs')

const KB = 5

const mockObj = {
    'code': 200,
    'message': null,
    'data': {
        'columnNames': ["id", "code", "name", "address", "status", "create_time", "creator", "modify_time", "modifier", "level", "nature"],
      // 更改数组长度，生成不同大小的数据
        'rows|6': [
            [
                {
                    'value': '@natural(0,9999)',
                    'javaType': 'STRING',
                    'sqlType': 12
                },
                {
                    'value': '@natural(9999999999)',
                    'javaType': 'STRING',
                    'sqlType': 12
                },
                {
                    'value': '@natural(99999)',
                    'javaType': 'STRING',
                    'sqlType': 12
                },
                {
                    'value': '@natural(0,9999)',
                    'javaType': 'INT',
                    'sqlType': 4
                },
                {
                    'value': '@date("yyyy-MM-dd")',
                    'javaType': 'LOCAL_DATE_STRING',
                    'sqlType': 91
                },
                {
                    'value': '@name()',
                    'javaType': 'STRING',
                    'sqlType': 12
                },
                {
                    'value': '@date("yyyy-MM-dd")',
                    'javaType': 'LOCAL_DATE_STRING',
                    'sqlType': 91
                },
                {
                    'value': '@name()',
                    'javaType': 'STRING',
                    'sqlType': 12
                },
                {
                    'value': '@natural(0,9999)',
                    'javaType': 'INT',
                    'sqlType': 4
                },
                {
                    'value': '@natural(0,9999)',
                    'javaType': 'INT',
                    'sqlType': 4
                }
            ]
        ]
    }
}

const data = Mock.mock(mockObj)

const buf = Buffer.from(JSON.stringify(data, null, 2), 'utf8')

const curkb = buf.byteLength / 1024

console.log('当前大小：', curkb + 'KB')
console.log('需要大小：', KB + 'KB~' + (KB + 1) + 'KB')

if (curkb > KB && curkb < KB + 1) {
    fs.writeFile(`./${KB}kb.json`, buf, () => {
        console.log(`生成数据成功 -> ${KB}kb.json`)
    })
}

```
{% endfolding %}

## 压缩基准测试

> 环境：11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz

使用JMH进行基准测试

{% folding 基准测试代码实现 %}
```java
package com.mija.tpa;


import com.github.luben.zstd.Zstd;
import org.apache.commons.compress.compressors.lz4.FramedLZ4CompressorOutputStream;
import org.apache.commons.compress.compressors.snappy.FramedSnappyCompressorOutputStream;
import org.openjdk.jmh.annotations.Benchmark;
import org.openjdk.jmh.annotations.BenchmarkMode;
import org.openjdk.jmh.annotations.Fork;
import org.openjdk.jmh.annotations.Level;
import org.openjdk.jmh.annotations.Measurement;
import org.openjdk.jmh.annotations.Mode;
import org.openjdk.jmh.annotations.OutputTimeUnit;
import org.openjdk.jmh.annotations.Param;
import org.openjdk.jmh.annotations.Scope;
import org.openjdk.jmh.annotations.Setup;
import org.openjdk.jmh.annotations.State;
import org.openjdk.jmh.annotations.TearDown;
import org.openjdk.jmh.annotations.Threads;
import org.openjdk.jmh.annotations.Warmup;
import org.openjdk.jmh.runner.Runner;
import org.openjdk.jmh.runner.RunnerException;
import org.openjdk.jmh.runner.options.Options;
import org.openjdk.jmh.runner.options.OptionsBuilder;
import org.openjdk.jmh.runner.options.VerboseMode;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.TimeUnit;
import java.util.zip.Deflater;
import java.util.zip.GZIPOutputStream;

@Warmup(iterations = 16, time = 500, timeUnit = TimeUnit.MILLISECONDS)
@Measurement(iterations = 8, time = 500, timeUnit = TimeUnit.MILLISECONDS)
@OutputTimeUnit(TimeUnit.MILLISECONDS)
@BenchmarkMode(Mode.AverageTime)
@Threads(Threads.MAX) // 8
@Fork(value = 1, jvmArgsAppend = {/*"-Xms4g", "-Xmx8g", */"-XX:+UseZGC", "-XX:+AlwaysPreTouch", "-XX:+UseGCOverheadLimit", "-XX:+ExplicitGCInvokesConcurrent"})
@State(Scope.Benchmark)
public class ProtocolCompressBenchmarkTest {

    public byte[] origin;

    public byte[] compress;

    @Param({"0.1", "0.5", "1", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30"})
    public String fileSize;

    @Setup(Level.Trial)
    public void setup() throws IOException {
        try (InputStream stream = getClass().getResourceAsStream("/mock/" + fileSize + "kb.json")) {
            assert stream != null;
            origin = stream.readAllBytes();
            byte[] c = _snappy();
            compress = new byte[c.length + 1];
            System.arraycopy(c, 0, compress, 1, c.length);
            compress[0] = (byte) 0xffff;
        }
    }


    @TearDown(Level.Trial)
    public void tearDown() {
        System.out.println("压缩前: " + origin.length / 1024.0 + "kB");
        System.out.println("压缩后: " + compress.length / 1024.0 + "kB");
    }

    //    @Benchmark
    public void zstd() {
        byte[] c = zstd6();
        byte[] bytes = new byte[c.length + 1];
        System.arraycopy(c, 0, bytes, 1, c.length);
        bytes[0] = (byte) 0xffff;
    }

    public byte[] zstd3() {
        return Zstd.compress(origin, 3);
    }

    public byte[] zstd6() {
        return Zstd.compress(origin, 6);
    }

    //    @Benchmark
    public void lz4() throws IOException {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream(1024)) {
            try (FramedLZ4CompressorOutputStream lz4Stream = new FramedLZ4CompressorOutputStream(outputStream)) {
                lz4Stream.write(origin);
            }
            byte[] c = outputStream.toByteArray();
            byte[] bytes = new byte[c.length + 1];
            System.arraycopy(c, 0, bytes, 1, c.length);
            bytes[0] = (byte) 0xffff;
        }
    }

    public byte[] _lz4() throws IOException {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream(1024)) {
            try (FramedLZ4CompressorOutputStream lz4Stream = new FramedLZ4CompressorOutputStream(outputStream)) {
                lz4Stream.write(origin);
            }
            return outputStream.toByteArray();
        }
    }

    //    @Benchmark
    public void gzip() throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream(1024)) {
            try (GZIPOutputStream gzip = new GZIPOutputStream(out)) {
                gzip.write(origin);
            }
            byte[] c = out.toByteArray();
            byte[] bytes = new byte[c.length + 1];
            System.arraycopy(c, 0, bytes, 1, c.length);
            bytes[0] = (byte) 0xffff;
        }
    }

    public byte[] _gzip() throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream(1024)) {
            try (GZIPOutputStream gzip = new GZIPOutputStream(out)) {
                gzip.write(origin);
            }
            return out.toByteArray();
        }
    }

    @Benchmark
    public void snappy() throws IOException {
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream(1024)) {
            try (FramedSnappyCompressorOutputStream out = new FramedSnappyCompressorOutputStream(bos)) {
                out.write(origin);
            }
            byte[] c = bos.toByteArray();
            byte[] bytes = new byte[c.length + 1];
            System.arraycopy(c, 0, bytes, 1, c.length);
            bytes[0] = (byte) 0xffff;
        }
    }

    public byte[] _snappy() throws IOException {
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream(1024)) {
            try (FramedSnappyCompressorOutputStream out = new FramedSnappyCompressorOutputStream(bos)) {
                out.write(origin);
            }
            return bos.toByteArray();
        }
    }


    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(ProtocolCompressBenchmarkTest.class.getSimpleName())
                .verbosity(VerboseMode.NORMAL)
                .build();
        new Runner(opt).run();
    }

}

```
{% endfolding %}

## 计算&绘图

使用Chart.js绘图

{% folding 绘图代码实现 %}
```javascript
<!DOCTYPE html>
<html>

<head>
    <title>Compression Analysis Chart</title>
    <style>
        .chart {
            width: 100wv;
            height: 100hv;
        }
    </style>
    <script src="./chart.js"></script>
    <script src="./chartjs-plugin-datalabels.js"></script>
</head>

<body>
    <canvas id="compressionChart" class="chart"></canvas>
</body>

<script>
    const origins = [0.088, 0.269, 1.247, 2.431, 4.599, 6.760, 7.834, 10.003, 12.163, 14.323, 16.486, 17.586, 19.730, 21.890, 24.053, 26.223, 28.378, 30.552] // 压缩前大小(kB)

    function getPoints(compress, compressionTimes) {
        return origins.map((origin, index) => ({ 'x': origins[index], 'y': (origin - compress[index]) / compressionTimes[index], 'compress': compress[index] }))
    }

    const zstd3Compress = [0.087, 0.152, 0.353, 0.467, 0.642, 0.817, 0.889, 1.064, 1.187, 1.354, 1.473, 1.561, 1.737, 1.801, 2.001, 2.182, 2.351, 2.414] // 压缩后大小(kB)
    const zstd3CompressionTimes = [0.010, 0.016, 0.022, 0.025, 0.032, 0.037, 0.039, 0.049, 0.053, 0.058, 0.075, 0.077, 0.078, 0.089, 0.086, 0.091, 0.094, 0.100] // 压缩时间(ms)
    const zstd3DataPoints = getPoints(zstd3Compress, zstd3CompressionTimes)

    const zstd6Compress = [0.086, 0.149, 0.334, 0.428, 0.592, 0.745, 0.813, 0.967, 1.091, 1.199, 1.386, 1.449, 1.595, 1.707, 1.897, 2.012, 2.134, 2.258] // 压缩后大小(kB)
    const zstd6CompressionTimes = [0.012, 0.021, 0.036, 0.058, 0.084, 0.094, 0.112, 0.130, 0.158, 0.163, 0.284, 0.292, 0.325, 0.378, 0.385, 0.427, 0.451, 0.563]; // 压缩时间(ms)
    const zstd6DataPoints = getPoints(zstd6Compress, zstd6CompressionTimes)

    const lz4Compress = [0.105, 0.198, 0.428, 0.549, 0.793, 1.006, 1.123, 1.313, 1.507, 1.684, 1.899, 1.999, 2.216, 2.425, 2.613, 2.795, 2.958, 3.160] // 压缩后大小(kB)
    const lz4CompressionTimes = [7.986, 2.684, 2.666, 2.735, 2.626, 2.621, 2.602, 2.689, 2.842, 3.172, 3.579, 4.099, 4.539, 5.135, 6.494, 6.369, 8.348, 8.961]; // 压缩时间(ms)
    const lz4DataPoints = getPoints(lz4Compress, lz4CompressionTimes)

    const zlibCompress = [0.075, 0.146, 0.325, 0.412, 0.592, 0.745, 0.838, 0.984, 1.128, 1.261, 1.414, 1.491, 1.660, 1.808, 1.954, 2.098, 2.220, 2.355] // 压缩后大小(kB)
    const zlibCompressionTimes = [0.037, 0.042, 0.055, 0.070, 0.102, 0.136, 0.165, 0.191, 0.229, 0.266, 0.303, 0.317, 0.367, 0.408, 0.448, 0.490, 0.534, 0.614]; // 压缩时间(ms)
    const zlibDataPoints = getPoints(zlibCompress, zlibCompressionTimes)

    const gzipCompress = [0.087, 0.157, 0.337, 0.424, 0.603, 0.756, 0.850, 0.996, 1.140, 1.272, 1.426, 1.503, 1.672, 1.820, 1.966, 2.109, 2.231, 2.367] // 压缩后大小(kB)
    const gzipCompressionTimes = [0.042, 0.041, 0.054, 0.070, 0.107, 0.139, 0.152, 0.193, 0.225, 0.261, 0.306, 0.313, 0.367, 0.399, 0.436, 0.509, 0.503, 0.580]; // 压缩时间(ms)
    const gzipDataPoints = getPoints(gzipCompress, gzipCompressionTimes)

    const snappyCompress = [0.097, 0.195, 0.433, 0.591, 0.893, 1.179, 1.322, 1.597, 1.845, 2.086, 2.375, 2.500, 2.802, 3.041, 3.334, 3.536, 3.764, 4.038] // 压缩后大小(kB)
    const snappyCompressionTimes = [0.793, 0.235, 0.212, 0.212, 0.216, 0.233, 0.234, 0.252, 0.274, 0.314, 0.380, 0.414, 0.416, 0.479, 0.581, 0.566, 0.765, 0.867]; // 压缩时间(ms)
    const snappyDataPoints = getPoints(snappyCompress, snappyCompressionTimes)

    // 使用 Chart.js 创建线性图
    const ctx = document.getElementById('compressionChart').getContext('2d')
    Chart.register(ChartDataLabels)
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Zstd-3',
                    data: zstd3DataPoints,
                    backgroundColor: 'rgba(255, 99, 132, 1)',
                    datalabels: {
                        display: true,
                        align: 'top',
                        anchor: 'end',
                        formatter: (value, ctx) => {
                            return value.y.toFixed(3)
                        },
                        color: 'black'
                    }
                },
                {
                    label: 'Zstd-6',
                    data: zstd6DataPoints,
                    backgroundColor: 'rgba(205, 199, 132, 1)',
                    datalabels: {
                        display: true,
                        align: 'top',
                        anchor: 'end',
                        formatter: (value, ctx) => {
                            return value.y.toFixed(3)
                        },
                        color: 'black'
                    }
                },
                {
                    label: 'Lz4',
                    data: lz4DataPoints,
                    backgroundColor: 'rgba(265, 55, 162, 1)',
                    datalabels: {
                        display: true,
                        align: 'top',
                        anchor: 'end',
                        formatter: (value, ctx) => {
                            return value.y.toFixed(3)
                        },
                        color: 'black'
                    }
                },
                {
                    label: 'zlib',
                    data: zlibDataPoints,
                    backgroundColor: 'rgba(265, 55, 255, 1)',
                    datalabels: {
                        display: true,
                        align: 'top',
                        anchor: 'end',
                        formatter: (value, ctx) => {
                            return value.y.toFixed(3)
                        },
                        color: 'black'
                    }
                },
                {
                    label: 'gzip',
                    data: gzipDataPoints,
                    backgroundColor: 'rgba(100, 55, 255, 1)',
                    datalabels: {
                        display: true,
                        align: 'top',
                        anchor: 'end',
                        formatter: (value, ctx) => {
                            return value.y.toFixed(3)
                        },
                        color: 'black'
                    }
                },
                {
                    label: 'snappy',
                    data: snappyDataPoints,
                    backgroundColor: 'rgba(200, 255, 155, 1)',
                    datalabels: {
                        display: true,
                        align: 'top',
                        anchor: 'end',
                        formatter: (value, ctx) => {
                            return value.y.toFixed(3)
                        },
                        color: 'black'
                    }
                }
            ],
        },
        options: {
            title: {
                display: true,
                text: 'Compression'
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'File size (kB)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Saving/Time (kB/ms)'
                    }
                }
            },
            interaction: {
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        footer: (es) => {
                            return `origin: ${es[0].raw.x} kB\ncompress: ${es[0].raw.compress} kB\nsaving: ${(es[0].raw.x - es[0].raw.compress).toFixed(3)} kB`
                        },
                    }
                },
                datalabels: {
                    display: false
                }
            },
            elements: {
                point: {
                    radius: 4
                },
                line: {
                    tension: 0.1
                }
            }
        },
        plugins: [ChartDataLabels]
    });
</script>

</html>
```
{% endfolding %}

## 测试结果

![测试结果](https://spcookie.oss-cn-hangzhou.aliyuncs.com/20240906100257-2024-09-06.png)

**结论：使用Zstd压缩算法，压缩阈值选取8kB**