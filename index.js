require("dotenv").config();
const express = require("express"); // Adding Express
const puppeteer = require("puppeteer");
const fs = require("fs");

const cnpj_pesquisa = '';

const app = express(); // Initializing Express

app.get("/simples", function (req, res) {
  puppeteer
    .launch({
      headless: true,
      args: [
        "--disable-gpu",
        "--full-memory-crash-report",
        "--unlimited-storage",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    })
    .then(async function (browser) {
      const page = await browser.newPage();
      await page.goto(
        `https://consopt.www8.receita.fazenda.gov.br/consultaoptantes`,
        {
          waituntil: "networkidle0",
        }
      );

      await page.waitForSelector("#Cnpj");
      await page.type("#Cnpj", cnpj_pesquisa);

      await page.click("#consultarForm > button");

      await page.waitForSelector("#conteudo > h5 > span");

      const a1 = await page.$eval(
        "#conteudo > h5 > span",
        (el) => el.innerText
      );
      console.log("Data da consulta: ", a1);

      const a2 = await page.$eval(
        "#conteudo > div:nth-child(2) > div.panel-body > span:nth-child(7)",
        (el) => el.innerText
      );
      console.log("CNPJ: ", cnpj_pesquisa);
      console.log("Nome Empresarial: ", a2);

      const a3 = await page.$eval(
        "#conteudo > div:nth-child(3) > div.panel-body > span:nth-child(1)",
        (el) => el.innerText
      );
      console.log("Situação no Simples Nacional: ", a3);

      const a4 = await page.$eval(
        "#conteudo > div:nth-child(3) > div.panel-body > span:nth-child(3)",
        (el) => el.innerText
      );
      console.log("Situação no SIMEI: ", a4);

      await page.click("#btnMaisInfo");
      await page.waitForSelector(
        "#maisInfo > div:nth-child(2) > div.panel-body"
      );

      const a5 = await page.$eval(
        "#maisInfo > div:nth-child(2) > div.panel-body > span:nth-child(1) > span",
        (el) => el.innerText
      );
      console.log("Opções pelo Simples Nacional em Períodos Anteriores: ", a5);

      const a8 = await page.$eval(
        "#maisInfo > div:nth-child(2) > div.panel-body > span:nth-child(4) > span",
        (el) => el.innerText
      );
      console.log("Enquadramentos no SIMEI em Períodos Anteriores:  ", a8);

      const a7 = await page.$eval(
        "#maisInfo > div:nth-child(3) > div.panel-body",
        (el) => el.innerText
      );
      console.log("Eventos Futuros (Simples Nacional): ", a7);

      const a6 = await page.$eval(
        "#maisInfo > div:nth-child(4) > div.panel-body",
        (el) => el.innerText
      );
      console.log("Eventos Futuros (SIMEI): ", a6);

      await page.pdf({
        path: "./download/ConsultaOptantes.pdf",
        format: "A4",
        printBackground: true,
      });

      fs.rename(
        "./download/ConsultaOptantes.pdf",
        `./download/${cnpj_pesquisa}_${a1.substring(0,10).replace("\/","").replace("/","")}.pdf`,
        function (err) {
          if (err) throw err;
          console.log("File Renamed.");
        }
      );

      const return_json = {
        date: a1,
        cnpj: cnpj_pesquisa,
        razao_social: a2,
        situacao_simples: a3,
        situacao_simei: a4,
        periodos_anteriores_simples: a5,
        periodos_anteriores_simei: a8,
        eventos_fututos_simples: a7,
        eventos_futuros_simei: a6,
      };

      await browser.close();

      res.json(return_json);
    });
});

app.listen(7000, function () {
  console.log("Running on port 7000.");
});

