let chai = require('chai');
let mocha = require('mocha');
let chaiHttp = require('chai-http');
let assert = require('assert');

const expect = require('chai').expect;
chai.use(chaiHttp);
const url= 'http://localhost:3000';


describe('Transfer Money', () => {
    let contractAddress = '0xf75c20acb77ca7cce4975549dfacf7f44e76ce43';
    it('Get Tokens Owner', function (done) {
        this.timeout(20000);
        chai.request(url)
            .post('/bets/tokens/getFromAddress')
            .send({
                address: '0xD7938F40cE185a0B4CD82eeD99bB31d0D93c5c54',
                contractAddress: contractAddress
            })
            .end(function(err,res) {
                console.log(res.body);
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Transfer Tokens', function (done) {
        this.timeout(200000);
        chai.request(url)
            .post('/bets/tokens/transfer')
            .send({
                toAddress: '0xe7fE10BAC6a63Ad51712Dc75Cd05414B39B8EAd6',
                fromAddress: '0xD7938F40cE185a0B4CD82eeD99bB31d0D93c5c54',
                tokens: 100,
                contractAddress: contractAddress
            })
            .end(function(err,res) {
                expect(res).to.have.status(200);
                done();
            });
    });
    it('Transfer Tokens 2', function (done) {
        this.timeout(200000);
        chai.request(url)
            .post('/bets/tokens/transfer')
            .send({
                toAddress: '0xf6530d95CA04FA4C6b3D006777B882f6E7BEe05d',
                fromAddress: '0xD7938F40cE185a0B4CD82eeD99bB31d0D93c5c54',
                tokens: 100,
                contractAddress: contractAddress
            })
            .end(function(err,res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Get Tokens 1', function (done) {
        this.timeout(20000);
        chai.request(url)
            .post('/bets/tokens/getFromAddress')
            .send({
                address: '0xe7fE10BAC6a63Ad51712Dc75Cd05414B39B8EAd6',
                contractAddress: contractAddress
            })
            .end(function(err,res) {
                console.log(res.body);
                expect(res).to.have.status(200);
                done();
            });
    });
    it('Get Tokens 2', function (done) {
        this.timeout(20000);
        chai.request(url)
            .post('/bets/tokens/getFromAddress')
            .send({
                address: '0xf6530d95CA04FA4C6b3D006777B882f6E7BEe05d',
                contractAddress: contractAddress
            })
            .end(function(err,res) {
                console.log(res.body);
                expect(res).to.have.status(200);
                done();
            });
    });
    it('Get Tokens Owner 2', function (done) {
        this.timeout(20000);
        chai.request(url)
            .post('/bets/tokens/getFromAddress')
            .send({
                address: '0xD7938F40cE185a0B4CD82eeD99bB31d0D93c5c54',
                contractAddress: contractAddress
            })
            .end(function(err,res) {
                console.log(res.body);
                expect(res).to.have.status(200);
                done();
            });
    });

});

describe('BET', () => {
    let bet = {
        summoner: "FB Agurin",
        game: {},
        teamA: [],
        teamB: [],
        team: "A",
        tokens: 30,
        duration: 30
    };

    let contractAddress = '0xf75c20acb77ca7cce4975549dfacf7f44e76ce43';
    let betId = '';

    it('Search Summoner', function (done) {
        this.timeout(20000);
        chai.request(url)
        .post('/summoners/searchSummoner')
        .send({
            summonerName: bet.summoner
        })
        .end( function(err,res) {
            bet.game = res.body;
            console.log(bet);
            expect(res).to.have.status(200);
            done();
        });
    });

    it('Create Teams', function (done) {
        this.timeout(20000);
        bet.game.participants.forEach(participant => {
            if(participant.team === 100) {
                bet.teamA.push(participant);
            } else if(participant.team === 200) {
                bet.teamB.push(participant);
            }
        });
        assert.strictEqual(bet.teamA.length, 5);
        assert.strictEqual(bet.teamB.length, 5);
        done();
    });

    it('Create Bet', function (done) {
        this.timeout(200000);
        chai.request(url)
            .post('/bets/create')
            .send({
                bet: bet,
                address: '0xe7fE10BAC6a63Ad51712Dc75Cd05414B39B8EAd6',
                contractAddress: contractAddress
            })
            .end( function(err,res) {
                if(err || res.body === 'Error') {
                    console.log('error', err);
                    done();
                } else {
                    console.log('result', res.body);
                    betId = res.body.bet.id;
                    done();
                }
            });
    });

    it('Accept Bet', function (done) {
        console.log('betId', betId);
        this.timeout(20000);
        chai.request(url)
            .post('/bets/accept')
            .send({
                tokens: 30,
                id: betId,
                bet: betId,
                address: '0xf6530d95CA04FA4C6b3D006777B882f6E7BEe05d',
                contractAddress: contractAddress
            })
            .end( function(err,res) {
                done();
            });
    });

});
